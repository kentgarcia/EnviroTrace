// client/src/presentation/roles/urban-greening/pages/tree-inventory/components/TreeImageUpload.tsx
/**
 * Tree Image Upload Component
 * Features: Drag & drop, multiple images, compression before upload, preview with metadata
 */

import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Label } from "@/presentation/components/shared/ui/label";
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Check } from "lucide-react";
import imageCompression from "browser-image-compression";
import { uploadTreeImages, ImageUploadResponse } from "@/core/api/upload-api";

// Types for uploaded images with metadata
export interface UploadedImage {
  url: string;
  path?: string;
  filename: string;
  size: number;
  uploaded_at: string;
  uploaded_by_id?: string;
  uploaded_by_email?: string;
}

interface TreeImageUploadProps {
  /** Existing photos (URLs or UploadedImage objects) */
  initialPhotos?: (string | UploadedImage)[];
  /** Callback when photos change */
  onPhotosChange: (photos: UploadedImage[]) => void;
  /** Tree ID for organizing uploads */
  treeId?: string;
  /** Maximum number of images allowed */
  maxImages?: number;
  /** Whether the upload is disabled */
  disabled?: boolean;
}

interface PendingFile {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "compressing" | "uploading" | "success" | "error";
  error?: string;
  progress?: number;
}

const TreeImageUpload: React.FC<TreeImageUploadProps> = ({
  initialPhotos = [],
  onPhotosChange,
  treeId,
  maxImages = 10,
  disabled = false,
}) => {
  // Convert initial photos to UploadedImage format
  const normalizePhotos = (photos: (string | UploadedImage)[]): UploadedImage[] => {
    return photos.map((photo) => {
      if (typeof photo === "string") {
        return {
          url: photo,
          filename: photo.split("/").pop() || "image.jpg",
          size: 0,
          uploaded_at: new Date().toISOString(),
        };
      }
      return photo;
    });
  };

  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedImage[]>(
    normalizePhotos(initialPhotos)
  );
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compression options
  const compressionOptions = {
    maxSizeMB: 1, // Max 1MB after compression
    maxWidthOrHeight: 1920, // Max dimension
    useWebWorker: true,
    fileType: "image/jpeg" as const,
  };

  const handleFileSelect = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const totalCount = uploadedPhotos.length + pendingFiles.length + fileArray.length;

      if (totalCount > maxImages) {
        alert(`Maximum ${maxImages} images allowed. You can add ${maxImages - uploadedPhotos.length - pendingFiles.length} more.`);
        return;
      }

      // Create pending file entries
      const newPendingFiles: PendingFile[] = fileArray.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        status: "pending" as const,
      }));

      setPendingFiles((prev) => [...prev, ...newPendingFiles]);
    },
    [uploadedPhotos.length, pendingFiles.length, maxImages]
  );

  const processAndUploadFiles = useCallback(async () => {
    if (pendingFiles.length === 0 || isUploading) return;

    setIsUploading(true);
    const filesToUpload = pendingFiles.filter((f) => f.status === "pending");

    if (filesToUpload.length === 0) {
      setIsUploading(false);
      return;
    }

    // Compress files
    const compressedFiles: File[] = [];
    for (const pendingFile of filesToUpload) {
      try {
        // Update status to compressing
        setPendingFiles((prev) =>
          prev.map((f) =>
            f.id === pendingFile.id ? { ...f, status: "compressing" as const } : f
          )
        );

        // Compress the image
        const compressed = await imageCompression(pendingFile.file, compressionOptions);
        compressedFiles.push(new File([compressed], pendingFile.file.name, { type: "image/jpeg" }));

        // Update status to uploading
        setPendingFiles((prev) =>
          prev.map((f) =>
            f.id === pendingFile.id ? { ...f, status: "uploading" as const } : f
          )
        );
      } catch (error) {
        console.error("Compression error:", error);
        setPendingFiles((prev) =>
          prev.map((f) =>
            f.id === pendingFile.id
              ? { ...f, status: "error" as const, error: "Compression failed" }
              : f
          )
        );
      }
    }

    // Upload compressed files
    if (compressedFiles.length > 0) {
      try {
        const response = await uploadTreeImages(compressedFiles, treeId);

        // Process results
        const successUrls: UploadedImage[] = response.uploaded.map((item: ImageUploadResponse) => ({
          url: item.url!,
          path: item.path,
          filename: item.filename,
          size: item.size || 0,
          uploaded_at: item.uploaded_at || new Date().toISOString(),
          uploaded_by_id: item.uploaded_by_id,
          uploaded_by_email: item.uploaded_by_email,
        }));

        // Update uploaded photos
        const newUploadedPhotos = [...uploadedPhotos, ...successUrls];
        setUploadedPhotos(newUploadedPhotos);
        onPhotosChange(newUploadedPhotos);

        // Update pending files status
        setPendingFiles((prev) =>
          prev.map((f, index) => {
            if (f.status === "uploading") {
              const uploadResult = response.uploaded.find(
                (u: ImageUploadResponse) => u.filename === f.file.name
              );
              const failResult = response.failed.find(
                (u: ImageUploadResponse) => u.filename === f.file.name
              );

              if (uploadResult?.success) {
                return { ...f, status: "success" as const };
              } else if (failResult) {
                return { ...f, status: "error" as const, error: failResult.error };
              }
            }
            return f;
          })
        );

        // Clear successful uploads after a delay
        setTimeout(() => {
          setPendingFiles((prev) => prev.filter((f) => f.status !== "success"));
        }, 2000);
      } catch (error) {
        console.error("Upload error:", error);
        setPendingFiles((prev) =>
          prev.map((f) =>
            f.status === "uploading"
              ? { ...f, status: "error" as const, error: "Upload failed" }
              : f
          )
        );
      }
    }

    setIsUploading(false);
  }, [pendingFiles, isUploading, treeId, uploadedPhotos, onPhotosChange]);

  const removePendingFile = useCallback((id: string) => {
    setPendingFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const removeUploadedPhoto = useCallback(
    (url: string) => {
      const newPhotos = uploadedPhotos.filter((p) => p.url !== url);
      setUploadedPhotos(newPhotos);
      onPhotosChange(newPhotos);
    },
    [uploadedPhotos, onPhotosChange]
  );

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        // Filter only image files
        const imageFiles = Array.from(files).filter((file) =>
          file.type.startsWith("image/")
        );
        if (imageFiles.length > 0) {
          handleFileSelect(imageFiles);
        }
      }
    },
    [disabled, handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelect(e.target.files);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleFileSelect]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">
        Photos ({uploadedPhotos.length}/{maxImages})
      </Label>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"}
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          Drag & drop images here or click to browse
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Images will be compressed before upload (max 1MB each)
        </p>
      </div>

      {/* Pending Files */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Ready to upload ({pendingFiles.filter((f) => f.status === "pending").length})
            </span>
            <Button
              type="button"
              size="sm"
              onClick={processAndUploadFiles}
              disabled={isUploading || pendingFiles.every((f) => f.status !== "pending")}
              className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload All
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {pendingFiles.map((file) => (
              <div
                key={file.id}
                className="relative group rounded-lg overflow-hidden border border-gray-200"
              >
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  {file.status === "pending" && (
                    <span className="text-white text-xs">Ready</span>
                  )}
                  {file.status === "compressing" && (
                    <div className="text-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin mx-auto" />
                      <span className="text-white text-xs">Compressing...</span>
                    </div>
                  )}
                  {file.status === "uploading" && (
                    <div className="text-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin mx-auto" />
                      <span className="text-white text-xs">Uploading...</span>
                    </div>
                  )}
                  {file.status === "success" && (
                    <div className="text-center">
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                      <span className="text-green-400 text-xs">Done!</span>
                    </div>
                  )}
                  {file.status === "error" && (
                    <div className="text-center">
                      <AlertCircle className="w-5 h-5 text-red-400 mx-auto" />
                      <span className="text-red-400 text-xs">{file.error}</span>
                    </div>
                  )}
                </div>
                {file.status === "pending" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePendingFile(file.id);
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Photos */}
      {uploadedPhotos.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700">Uploaded Photos</span>
          <div className="grid grid-cols-2 gap-3">
            {uploadedPhotos.map((photo, index) => (
              <div
                key={photo.url || index}
                className="relative group rounded-lg overflow-hidden border border-gray-200"
              >
                <img
                  src={photo.url}
                  alt={photo.filename}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs truncate">{photo.filename}</p>
                  <div className="flex justify-between text-gray-300 text-[10px]">
                    <span>{formatFileSize(photo.size)}</span>
                    <span>{formatDate(photo.uploaded_at)}</span>
                  </div>
                  {photo.uploaded_by_email && (
                    <p className="text-gray-300 text-[10px] truncate">
                      By: {photo.uploaded_by_email}
                    </p>
                  )}
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeUploadedPhoto(photo.url)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {uploadedPhotos.length === 0 && pendingFiles.length === 0 && (
        <div className="text-center py-4 text-gray-400">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No photos uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default TreeImageUpload;
