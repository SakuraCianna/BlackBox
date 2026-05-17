import json
import os
import urllib.request
import urllib.error
import ssl


GLM_BASE_URL = "https://open.bigmodel.cn/api/paas/v4"
GLM_MODEL = "glm-4v-flash"
API_KEY = os.environ.get("GLM_API_KEY", "")


def review_report(report_text: str, accident_title: str, actual_factors: list[str], matched_factors: list[str]) -> dict:
    if not API_KEY:
        return {
            "ai_score": 0,
            "ai_feedback": "AI 审查未启用：请在 backend/ai_review.py 中填写 API_KEY。",
            "chain_quality": "unknown",
        }

    actual_str = "、".join(actual_factors)
    matched_str = "、".join(matched_factors) if matched_factors else "无"

    prompt = f"""你是一位航空事故调查评审专家。请根据以下信息评估玩家的调查报告。

事故标题：{accident_title}
事故真实因素：{actual_str}
玩家选中的因素：{matched_str}

玩家报告内容：
{report_text if report_text.strip() else "（玩家未填写文字报告）"}

请从以下三个维度评分（每项 0-100 分），并给出简短中文评语：
1. 因果链完整性：是否把"线索→因素→影响→结果"串起来了？
2. 推理准确性：报告中提到的因素是否与真实事故链一致？
3. 专业深度：是否使用了航空调查术语、区分了直接原因和根本原因？

请严格以如下 JSON 格式返回，不要输出其他内容：
{{"chain_quality": <int>, "reasoning_accuracy": <int>, "professional_depth": <int>, "feedback": "<评语>"}}"""

    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        body = json.dumps({
            "model": GLM_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3,
            "max_tokens": 600,
        }).encode("utf-8")

        req = urllib.request.Request(
            f"{GLM_BASE_URL}/chat/completions",
            data=body,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {API_KEY}",
            },
            method="POST",
        )

        with urllib.request.urlopen(req, timeout=25, context=ctx) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        content = data["choices"][0]["message"]["content"].strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

        result = json.loads(content)
        chain_quality = int(result.get("chain_quality", 50))
        reasoning_accuracy = int(result.get("reasoning_accuracy", 50))
        professional_depth = int(result.get("professional_depth", 50))
        feedback = str(result.get("feedback", ""))

        ai_score = round(chain_quality * 0.4 + reasoning_accuracy * 0.35 + professional_depth * 0.25)

        if ai_score >= 80:
            chain_label = "完整"
        elif ai_score >= 55:
            chain_label = "部分完整"
        else:
            chain_label = "不完整"

        return {
            "ai_score": ai_score,
            "ai_feedback": feedback,
            "chain_quality": chain_label,
        }
    except (urllib.error.URLError, json.JSONDecodeError, KeyError, TimeoutError) as exc:
        return {
            "ai_score": 0,
            "ai_feedback": f"AI 审查请求失败：{exc}",
            "chain_quality": "unknown",
        }
