from pydantic import BaseModel


class DamageEvaluationResponse(BaseModel):
    score: int
    damages: list[str]
    reasoning: str
