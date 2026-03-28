from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.feedback import Feedback


def compute_s_raw(payment: int, behavior: int, prop: int, stability: int) -> float:
    return (0.40 * payment) + (0.25 * behavior) + (0.20 * prop) + (0.15 * stability)


def compute_trust_score_from_history(db: Session, *, tenant_id) -> int:
    """
    Trust score on a 0–1000 scale.

    - S_global = SMA of all historic S_raw (each 0–100).
    - Final score = round(S_global * 10), clamped to 0–1000.
    - Zero feedback history: inject S_global = 50 so the score is 500 (neutral).
    """
    rows = db.execute(
        select(
            func.avg(
                (0.40 * Feedback.payment_rating)
                + (0.25 * Feedback.behavior_rating)
                + (0.20 * Feedback.property_rating)
                + (0.15 * Feedback.stability_rating)
            )
        ).where(Feedback.tenant_id == tenant_id)
    ).scalar_one()

    if rows is None:
        s_global = 50.0
    else:
        s_global = float(rows)

    score = int(round(s_global * 10.0))
    return max(0, min(1000, score))
