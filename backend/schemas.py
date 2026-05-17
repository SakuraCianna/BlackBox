from pydantic import BaseModel, ConfigDict, Field


class CausalFactorRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    factor: str
    impact: str
    result: str
    explanation: str
    severity: str
    sort_order: int


class ClueRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    title: str
    content: str
    detail: str
    related_factor: str | None
    reliability: str
    sort_order: int


class HistoricalCaseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trigger_factor: str
    title: str
    content: str
    lesson: str
    sort_order: int


class TimelineEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    time: str
    speaker: str
    text: str
    is_key_moment: int
    sort_order: int


class AccidentListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    aircraft: str
    location: str
    flight_phase: str
    year: int


class AccidentDetail(AccidentListItem):
    dossier: str
    causal_chain: list[CausalFactorRead]
    clues: list[ClueRead]
    historical_cases: list[HistoricalCaseRead]
    timeline: list[TimelineEntryRead] = Field(default_factory=list)
    candidate_factors: list[str] = Field(default_factory=list)


class ReportSubmit(BaseModel):
    accident_id: int
    selected_factors: list[str] = Field(default_factory=list)
    chain_order: list[str] = Field(default_factory=list)
    report_text: str = ""


class ReportScoreResponse(BaseModel):
    score: int
    rating: str
    matched_factors: list[str]
    missed_factors: list[str]
    extra_factors: list[str]
    feedback: str
    unlocked_cases: list[HistoricalCaseRead]
    ai_score: int = 0
    ai_feedback: str = ""
    chain_quality: str = ""
    chain_order_score: int = 0
