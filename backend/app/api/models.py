from fastapi.routing import APIRouter


def get_models_router() -> APIRouter:
    router = APIRouter(prefix="/api/v1/models", tags=["models"])

    @router.get("/")
    def get_models() -> list[str] | None:
        return None

    return router
