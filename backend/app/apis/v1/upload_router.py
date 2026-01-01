# app/apis/v1/upload_router.py
"""API endpoints for file uploads to Supabase Storage"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from app.apis.deps import get_current_user, get_db
from app.models.auth_models import User
from app.services.storage_service import storage_service
from sqlalchemy.orm import Session


router = APIRouter(prefix="/upload", tags=["File Upload"])


class ImageUploadResponse(BaseModel):
    """Response schema for image upload"""
    success: bool
    url: Optional[str] = None
    path: Optional[str] = None
    filename: str
    content_type: Optional[str] = None
    size: Optional[int] = None
    uploaded_at: Optional[str] = None
    uploaded_by_id: Optional[str] = None
    uploaded_by_email: Optional[str] = None
    error: Optional[str] = None


class MultiImageUploadResponse(BaseModel):
    """Response schema for multiple image uploads"""
    uploaded: List[ImageUploadResponse]
    failed: List[ImageUploadResponse]
    total_uploaded: int
    total_failed: int


class StorageStatusResponse(BaseModel):
    """Response schema for storage status check"""
    connected: bool
    bucket_exists: bool
    bucket_name: str
    error: Optional[str] = None


# Allowed image types
ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.get("/status", response_model=StorageStatusResponse)
async def check_storage_status(current_user: User = Depends(get_current_user)):
    """
    Check Supabase Storage connection and bucket status.
    Useful for debugging upload issues.
    """
    try:
        # Check if bucket exists
        buckets = storage_service.client.storage.list_buckets()
        bucket_exists = any(b.name == storage_service.BUCKET_NAME for b in buckets)
        
        return StorageStatusResponse(
            connected=True,
            bucket_exists=bucket_exists,
            bucket_name=storage_service.BUCKET_NAME
        )
    except Exception as e:
        return StorageStatusResponse(
            connected=False,
            bucket_exists=False,
            bucket_name=storage_service.BUCKET_NAME,
            error=str(e)
        )


@router.post("/create-bucket")
async def create_storage_bucket(current_user: User = Depends(get_current_user)):
    """
    Manually create the storage bucket if it doesn't exist.
    Requires service role key to be configured.
    """
    try:
        success = storage_service.ensure_bucket_exists()
        if success:
            return {"success": True, "message": f"Bucket '{storage_service.BUCKET_NAME}' is ready"}
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to create bucket. Make sure SUPABASE_SERVICE_ROLE_KEY is configured in .env"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error: {str(e)}. Make sure SUPABASE_SERVICE_ROLE_KEY is configured."
        )


def validate_image(file: UploadFile) -> None:
    """Validate uploaded image file"""
    # Check content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed types: {', '.join(ALLOWED_CONTENT_TYPES)}"
        )


@router.post("/tree-image", response_model=ImageUploadResponse)
async def upload_tree_image(
    file: UploadFile = File(...),
    tree_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a single image for a tree.
    The image should be compressed on the client side before uploading.
    
    - **file**: The image file (JPEG, PNG, WebP, or GIF)
    - **tree_id**: Optional tree ID to associate the image with
    """
    validate_image(file)
    
    # Read file content
    file_content = await file.read()
    
    # Check file size
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB"
        )
    
    # Upload to storage
    result = storage_service.upload_image(
        file_content=file_content,
        filename=file.filename or "image.jpg",
        content_type=file.content_type or "image/jpeg",
        tree_id=tree_id,
        uploader_id=str(current_user.id),
        uploader_email=current_user.email
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {result.get('error', 'Unknown error')}"
        )
    
    return ImageUploadResponse(**result)


@router.post("/tree-images", response_model=MultiImageUploadResponse)
async def upload_tree_images(
    files: List[UploadFile] = File(...),
    tree_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    """
    Upload multiple images for a tree.
    Images should be compressed on the client side before uploading.
    
    - **files**: List of image files (JPEG, PNG, WebP, or GIF)
    - **tree_id**: Optional tree ID to associate the images with
    """
    uploaded = []
    failed = []
    
    for file in files:
        try:
            # Validate content type
            if file.content_type not in ALLOWED_CONTENT_TYPES:
                failed.append(ImageUploadResponse(
                    success=False,
                    filename=file.filename or "unknown",
                    error=f"Invalid file type '{file.content_type}'"
                ))
                continue
            
            # Read file content
            file_content = await file.read()
            
            # Check file size
            if len(file_content) > MAX_FILE_SIZE:
                failed.append(ImageUploadResponse(
                    success=False,
                    filename=file.filename or "unknown",
                    error=f"File too large (max {MAX_FILE_SIZE // (1024 * 1024)}MB)"
                ))
                continue
            
            # Upload to storage
            result = storage_service.upload_image(
                file_content=file_content,
                filename=file.filename or "image.jpg",
                content_type=file.content_type or "image/jpeg",
                tree_id=tree_id,
                uploader_id=str(current_user.id),
                uploader_email=current_user.email
            )
            
            if result.get("success"):
                uploaded.append(ImageUploadResponse(**result))
            else:
                failed.append(ImageUploadResponse(
                    success=False,
                    filename=file.filename or "unknown",
                    error=result.get("error", "Unknown error")
                ))
                
        except Exception as e:
            failed.append(ImageUploadResponse(
                success=False,
                filename=file.filename or "unknown",
                error=str(e)
            ))
    
    return MultiImageUploadResponse(
        uploaded=uploaded,
        failed=failed,
        total_uploaded=len(uploaded),
        total_failed=len(failed)
    )


@router.delete("/tree-image")
async def delete_tree_image(
    path: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete an image from storage.
    
    - **path**: The storage path of the image to delete
    """
    success = storage_service.delete_image(path)
    
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to delete image"
        )
    
    return {"success": True, "message": "Image deleted successfully"}
