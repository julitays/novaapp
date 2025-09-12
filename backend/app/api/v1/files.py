from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pathlib import Path
from uuid import uuid4
import os

from app.core.db import get_db

router = APIRouter(prefix="/files", tags=["files"])

ALLOWED = {"image/jpeg", "image/png", "image/webp"}

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),                # ключ FormData — "file"
    employee_id: str | None = Form(None),       # опционально
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED:
        raise HTTPException(status_code=415, detail="Unsupported image type")

    media_root = Path(os.environ.get("MEDIA_DIR", "/app/media"))
    dest_dir = media_root / "avatars"
    dest_dir.mkdir(parents=True, exist_ok=True)

    ext = (Path(file.filename).suffix or ".jpg").lower()
    name = f"{uuid4().hex}{ext}"
    dest_path = dest_dir / name

    try:
        with dest_path.open("wb") as fout:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                fout.write(chunk)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Save failed: {e}")

    url = f"/media/avatars/{name}"
    return JSONResponse({"url": url, "filename": file.filename, "content_type": file.content_type, "size": dest_path.stat().st_size}, status_code=201)
