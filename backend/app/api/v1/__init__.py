from fastapi import APIRouter

from app.api.v1 import auth, feedback, pg, requests, tenant, user


api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(user.router)
api_router.include_router(tenant.router)
api_router.include_router(pg.router)
api_router.include_router(requests.router)
api_router.include_router(feedback.router)

