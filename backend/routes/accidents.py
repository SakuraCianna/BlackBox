import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from ai_review import review_report
from database import get_db
from models import Accident, HistoricalCase, Submission
from schemas import AccidentDetail, AccidentListItem, ReportScoreResponse, ReportSubmit


router = APIRouter(tags=["accidents"])

DECOY_FACTORS = {
    1: ["突发强对流天气", "发动机双发失效", "空管指令冲突"],
    2: ["燃油污染", "襟翼未按标准放出", "鸟击导致双发停车"],
    3: ["电池热失控", "载荷固定失效", "导航卫星完全中断"],
    4: ["客舱失压", "燃油耗尽", "雷击导致全电源丧失"],
    5: ["刹车系统失效", "跑道结冰", "机载防撞系统故障"],
}


def normalize_factor(value: str) -> str:
    return value.strip().lower().replace(" ", "")


def score_to_rating(score: int) -> tuple[str, str]:
    if score >= 85:
        return "优秀调查员", "你准确还原了事故链条，并能把直接原因与组织层面的根本原因联系起来。"
    if score >= 65:
        return "合格调查员", "你找到了主要因素，但报告仍需要补足遗漏环节或说明证据之间的因果关系。"
    if score >= 40:
        return "初级调查员", "你捕捉到部分线索，但还没有形成完整事故链。建议回看维护、天气、飞行记录等证据。"
    return "需要复盘", "当前结论与证据链偏差较大。先从直接异常入手，再追问它为什么会发生。"


def _lis_length(seq: list[int]) -> int:
    """最长递增子序列长度（O(n log n)）"""
    from bisect import bisect_left
    tails: list[int] = []
    for val in seq:
        pos = bisect_left(tails, val)
        if pos == len(tails):
            tails.append(val)
        else:
            tails[pos] = val
    return len(tails)


@router.get("/accidents", response_model=list[AccidentListItem])
def list_accidents(db: Session = Depends(get_db)):
    return db.query(Accident).order_by(Accident.id).all()


@router.get("/accidents/{accident_id}", response_model=AccidentDetail)
def get_accident(accident_id: int, db: Session = Depends(get_db)):
    accident = (
        db.query(Accident)
        .options(
            selectinload(Accident.causal_chain),
            selectinload(Accident.clues),
            selectinload(Accident.historical_cases),
            selectinload(Accident.timeline),
        )
        .filter(Accident.id == accident_id)
        .first()
    )
    if not accident:
        raise HTTPException(status_code=404, detail="事故档案不存在")

    candidate_factors = [factor.factor for factor in accident.causal_chain]
    candidate_factors.extend(DECOY_FACTORS.get(accident.id, []))
    detail = AccidentDetail.model_validate(accident)
    return detail.model_copy(update={"candidate_factors": candidate_factors})


@router.post("/submit-report", response_model=ReportScoreResponse)
def submit_report(payload: ReportSubmit, db: Session = Depends(get_db)):
    accident = (
        db.query(Accident)
        .options(selectinload(Accident.causal_chain), selectinload(Accident.historical_cases))
        .filter(Accident.id == payload.accident_id)
        .first()
    )
    if not accident:
        raise HTTPException(status_code=404, detail="事故档案不存在")

    actual_by_key = {normalize_factor(item.factor): item.factor for item in accident.causal_chain}
    selected_by_key = {normalize_factor(item): item for item in payload.selected_factors if item.strip()}
    report_key_text = normalize_factor(payload.report_text)

    matched_keys = sorted(set(actual_by_key) & set(selected_by_key))
    missed_keys = sorted(set(actual_by_key) - set(selected_by_key))
    extra_keys = sorted(set(selected_by_key) - set(actual_by_key))
    report_mentions = [key for key in actual_by_key if key in report_key_text]

    # 因果链排序评分
    actual_order = [normalize_factor(item.factor) for item in accident.causal_chain]
    actual_rank = {key: i for i, key in enumerate(actual_order)}
    chain_order_keys = [normalize_factor(f) for f in payload.chain_order if normalize_factor(f) in actual_rank]
    if len(chain_order_keys) >= 2:
        mapped = [actual_rank[k] for k in chain_order_keys]
        lis_len = _lis_length(mapped)
        chain_order_score = round((lis_len / len(actual_order)) * 100)
    elif len(chain_order_keys) == 1 and len(actual_order) == 1:
        chain_order_score = 100
    else:
        chain_order_score = 0

    factor_score = round((len(matched_keys) / max(len(actual_by_key), 1)) * 55)
    report_score = min(25, len(set(report_mentions)) * 8 + min(len(payload.report_text.strip()) // 80, 8))
    order_bonus = round(chain_order_score * 0.15)
    penalty = min(15, len(extra_keys) * 5)
    score = max(0, min(100, factor_score + report_score + order_bonus - penalty))
    rating, feedback = score_to_rating(score)

    matched_factors = [actual_by_key[key] for key in matched_keys]
    missed_factors = [actual_by_key[key] for key in missed_keys]
    extra_factors = [selected_by_key[key] for key in extra_keys]
    unlocked_cases = (
        db.query(HistoricalCase)
        .filter(HistoricalCase.accident_id == accident.id)
        .filter(HistoricalCase.trigger_factor.in_(matched_factors))
        .order_by(HistoricalCase.sort_order)
        .all()
    )

    ai_result = review_report(
        report_text=payload.report_text,
        accident_title=accident.title,
        actual_factors=[item.factor for item in accident.causal_chain],
        matched_factors=matched_factors,
    )

    if ai_result["ai_score"] > 0:
        score = max(0, min(100, round(score * 0.7 + ai_result["ai_score"] * 0.3)))
        rating, feedback = score_to_rating(score)
        feedback = ai_result["ai_feedback"] if ai_result["ai_feedback"] else feedback

    submission = Submission(
        accident_id=accident.id,
        selected_factors=json.dumps(payload.selected_factors, ensure_ascii=False),
        report_text=payload.report_text,
        score=score,
    )
    db.add(submission)
    db.commit()

    return ReportScoreResponse(
        score=score,
        rating=rating,
        matched_factors=matched_factors,
        missed_factors=missed_factors,
        extra_factors=extra_factors,
        feedback=feedback,
        unlocked_cases=unlocked_cases,
        ai_score=ai_result["ai_score"],
        ai_feedback=ai_result["ai_feedback"],
        chain_quality=str(ai_result["chain_quality"]),
        chain_order_score=chain_order_score,
    )
