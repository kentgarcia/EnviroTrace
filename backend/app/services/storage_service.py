# app/services/storage_service.py
"""Supabase Storage Service for file uploads"""

from supabase import create_client, Client
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
import os
import io

from app.core.config import settings


def get_supabase_client() -> Client:
    """Create and return a Supabase client with anon key for regular operations"""
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        raise ValueError("Supabase credentials not configured")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


def get_supabase_admin_client() -> Client:
    """Create and return a Supabase client with service role key for admin operations"""
    if not settings.SUPABASE_URL:
        raise ValueError("Supabase URL not configured")
    # Use service role key if available, otherwise fall back to anon key
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
    if not key:
        raise ValueError("Supabase credentials not configured")
    return create_client(settings.SUPABASE_URL, key)


class StorageService:
    """Service for handling Supabase Storage operations"""
    
    BUCKET_NAME = "tree-photos"
    
    def __init__(self):
        # Use admin client for storage operations (bucket creation needs service role)
        self.client = get_supabase_admin_client()
        self._bucket_checked = False
    
    def ensure_bucket_exists(self) -> bool:
        """Ensure the storage bucket exists, create if not"""
        # Only check once per service instance
        if self._bucket_checked:
            return True
            
        try:
            # Try to get bucket info
            buckets = self.client.storage.list_buckets()
            bucket_exists = any(b.name == self.BUCKET_NAME for b in buckets)
            
            if not bucket_exists:
                print(f"Creating bucket: {self.BUCKET_NAME}")
                # Create the bucket with public access for viewing images
                self.client.storage.create_bucket(
                    self.BUCKET_NAME,
                    options={
                        "public": True,
                        "file_size_limit": 10485760,  # 10MB limit
                        "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "image/gif"]
                    }
                )
                print(f"Bucket {self.BUCKET_NAME} created successfully")
            else:
                print(f"Bucket {self.BUCKET_NAME} already exists")
                
            self._bucket_checked = True
            return True
        except Exception as e:
            print(f"Error ensuring bucket exists: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def upload_image(
        self,
        file_content: bytes,
        filename: str,
        content_type: str,
        tree_id: Optional[str] = None,
        uploader_id: Optional[str] = None,
        uploader_email: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upload an image to Supabase Storage
        
        Args:
            file_content: The file bytes
            filename: Original filename
            content_type: MIME type of the file
            tree_id: Optional tree ID for organizing files
            uploader_id: ID of the user uploading
            uploader_email: Email of the user uploading
            
        Returns:
            Dict with url, path, and metadata
        """
        # Generate unique filename with timestamp
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        file_ext = os.path.splitext(filename)[1].lower() or ".jpg"
        
        # Organize by tree_id if provided, else use 'general' folder
        folder = f"trees/{tree_id}" if tree_id else "general"
        unique_filename = f"{folder}/{timestamp}_{filename.replace(' ', '_')}"
        
        # Upload to Supabase Storage
        try:
            self.ensure_bucket_exists()
            
            result = self.client.storage.from_(self.BUCKET_NAME).upload(
                path=unique_filename,
                file=file_content,
                file_options={
                    "content-type": content_type,
                    "upsert": "false"
                }
            )
            
            # Get public URL
            public_url = self.client.storage.from_(self.BUCKET_NAME).get_public_url(unique_filename)
            
            # Return upload result with metadata
            return {
                "success": True,
                "url": public_url,
                "path": unique_filename,
                "filename": filename,
                "content_type": content_type,
                "size": len(file_content),
                "uploaded_at": datetime.utcnow().isoformat(),
                "uploaded_by_id": uploader_id,
                "uploaded_by_email": uploader_email,
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "filename": filename
            }
    
    def delete_image(self, path: str) -> bool:
        """Delete an image from storage"""
        try:
            self.client.storage.from_(self.BUCKET_NAME).remove([path])
            return True
        except Exception as e:
            print(f"Error deleting image: {e}")
            return False
    
    def get_image_url(self, path: str) -> str:
        """Get public URL for an image"""
        return self.client.storage.from_(self.BUCKET_NAME).get_public_url(path)


# Singleton instance
storage_service = StorageService()
