from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.investigations import (
    router as investigations_router,
)

from app.routes.detection import (
    router as detection_router,
)

from app.routes.import_csv import (
    router as import_csv_router,
)


app = FastAPI(
    title="Fin-Sentinel API",
    description="Human-in-the-loop financial investigation engine",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Existing investigation API
app.include_router(investigations_router)

# Existing detection API
app.include_router(detection_router)

# CSV import API
app.include_router(import_csv_router)


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