import json
import uuid

import google.generativeai as genai
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.config import settings
from app.core.database import get_db
from app.models.enums import Role
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.damages import DamageEvaluationResponse

router = APIRouter(prefix="/damages", tags=["damages"])

_ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB per image

_SYSTEM_PROMPT = (
    "You are an expert property inspector. "
    "Image 1 is the Move-In condition. Image 2 is the Move-Out condition. "
    "Compare them and identify new damages, ignoring normal wear and tear. "
    "Provide a score from 0 to 100 (100 = perfect condition). "
    'Respond strictly in JSON format with keys: "score" (number), '
    '"damages" (array of strings), and "reasoning" (string).'
)


def _validate_image(file: UploadFile, label: str) -> None:
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in _ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{label}: Invalid image type. Use JPEG, PNG, WebP, or GIF.",
        )


@router.post("/evaluate", response_model=DamageEvaluationResponse)
async def evaluate_damages(
    moveInImage: UploadFile = File(...),
    moveOutImage: UploadFile = File(...),
    _: User = Depends(require_role(Role.OWNER)),
):
    """Compare move-in vs move-out photos using Gemini and return a damage score."""
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API key is not configured. Set GEMINI_API_KEY in .env",
        )

    _validate_image(moveInImage, "Move-In Image")
    _validate_image(moveOutImage, "Move-Out Image")

    move_in_bytes = await moveInImage.read()
    move_out_bytes = await moveOutImage.read()

    if len(move_in_bytes) > _MAX_IMAGE_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Move-In image too large (max 10MB)")
    if len(move_out_bytes) > _MAX_IMAGE_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Move-Out image too large (max 10MB)")

    # Configure Gemini
    genai.configure(api_key=settings.gemini_api_key)
    # Using 'gemini-1.5-pro' for superior visual reasoning in property inspections
    model = genai.GenerativeModel(
        "gemini-1.5-pro",
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
        ),
    )

    move_in_mime = (moveInImage.content_type or "image/jpeg").split(";")[0].strip()
    move_out_mime = (moveOutImage.content_type or "image/jpeg").split(";")[0].strip()

    try:
        response = model.generate_content(
            [
                _SYSTEM_PROMPT,
                {"mime_type": move_in_mime, "data": move_in_bytes},
                {"mime_type": move_out_mime, "data": move_out_bytes},
            ]
        )

        result = json.loads(response.text)
        return DamageEvaluationResponse(
            score=int(result.get("score", 0)),
            damages=result.get("damages", []),
            reasoning=result.get("reasoning", ""),
        )
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini returned an invalid response. Please try again.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gemini API error: {str(e)}",
        )


@router.post("/apply-score")
def apply_damage_score(
    tenant_id: str = Form(...),
    score: int = Form(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(Role.OWNER)),
):
    """Apply the AI damage score to a tenant's trust score."""
    try:
        t_uuid = uuid.UUID(tenant_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid tenant_id")

    tenant = db.get(Tenant, t_uuid)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    # Map AI score (0-100) to trust score adjustment
    if score >= 90:
        points = 15
    elif score >= 70:
        points = 5
    elif score >= 50:
        points = 0
    elif score >= 30:
        points = -10
    else:
        points = -25

    tenant.trust_score = max(0, tenant.trust_score + points)
    db.add(tenant)
    db.commit()

    return {
        "message": f"Trust score updated by {points:+d} points.",
        "new_trust_score": tenant.trust_score,
        "points_applied": points,
    }
