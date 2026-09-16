from fastapi import FastAPI

from app.routes.investigations import router as investigations_router


app = FastAPI(
    title="Fin-Sentinel API",
    description="Human-in-the-loop financial investigation engine",
    version="1.0.0",
)


app.include_router(investigations_router)


@app.get("/")
def root():
    return {
        "service": "Fin-Sentinel",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }