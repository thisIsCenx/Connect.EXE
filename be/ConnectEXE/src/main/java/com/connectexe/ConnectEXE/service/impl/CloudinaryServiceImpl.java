package com.connectexe.ConnectEXE.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.connectexe.ConnectEXE.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * Implementation of CloudinaryService for image upload and management
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public Map<String, Object> uploadImage(MultipartFile file) throws IOException {
        return uploadImage(file, "connect-exe");
    }

    @Override
    public Map<String, Object> uploadImage(MultipartFile file, String folder) throws IOException {
        try {
            // Validate file
            validateImageFile(file);
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? 
                    originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            
            // Upload to Cloudinary
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "public_id", uniqueFilename.replace(fileExtension, ""),
                    "resource_type", "image",
                    "overwrite", true,
                    "quality", "auto:good"
            );
            
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            
            log.info("✅ Image uploaded successfully to Cloudinary: {}", uploadResult.get("secure_url"));
            
            return uploadResult;
            
        } catch (IOException e) {
            log.error("❌ Failed to upload image to Cloudinary: {}", e.getMessage());
            throw new IOException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> deleteImage(String publicId) throws IOException {
        try {
            Map<String, Object> deleteResult = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            
            log.info("🗑️ Image deleted from Cloudinary: {}", publicId);
            
            return deleteResult;
            
        } catch (IOException e) {
            log.error("❌ Failed to delete image from Cloudinary: {}", e.getMessage());
            throw new IOException("Failed to delete image: " + e.getMessage(), e);
        }
    }

    @Override
    public String extractPublicId(String imageUrl) {
        // Example URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/filename.jpg
        // Extract: folder/filename
        
        if (imageUrl == null || imageUrl.isEmpty()) {
            return null;
        }
        
        try {
            String[] parts = imageUrl.split("/upload/");
            if (parts.length < 2) {
                return null;
            }
            
            String pathAfterUpload = parts[1];
            // Remove version prefix (v1234567890/)
            String pathWithoutVersion = pathAfterUpload.replaceFirst("v\\d+/", "");
            // Remove file extension
            return pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf("."));
            
        } catch (Exception e) {
            log.error("❌ Failed to extract public ID from URL: {}", imageUrl);
            return null;
        }
    }

    /**
     * Validate uploaded image file
     */
    private void validateImageFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("File is empty");
        }
        
        // Check file size (max 10MB)
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new IOException("File size exceeds maximum limit of 10MB");
        }
        
        // Check file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IOException("File must be an image");
        }
        
        // Validate image extensions
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
            if (!extension.matches("jpg|jpeg|png|gif|webp|bmp")) {
                throw new IOException("Invalid image format. Allowed: JPG, PNG, GIF, WEBP, BMP");
            }
        }
    }
}
