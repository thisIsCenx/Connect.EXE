package com.connectexe.ConnectEXE.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Service interface for Cloudinary image operations
 */
public interface CloudinaryService {
    
    /**
     * Upload image to Cloudinary
     * 
     * @param file the image file to upload
     * @return Map containing upload result with URL
     * @throws IOException if upload fails
     */
    Map<String, Object> uploadImage(MultipartFile file) throws IOException;
    
    /**
     * Upload image with custom folder path
     * 
     * @param file the image file to upload
     * @param folder the folder path in Cloudinary (e.g., "users", "projects")
     * @return Map containing upload result with URL
     * @throws IOException if upload fails
     */
    Map<String, Object> uploadImage(MultipartFile file, String folder) throws IOException;
    
    /**
     * Delete image from Cloudinary by public ID
     * 
     * @param publicId the public ID of the image
     * @return Map containing deletion result
     * @throws IOException if deletion fails
     */
    Map<String, Object> deleteImage(String publicId) throws IOException;
    
    /**
     * Extract public ID from Cloudinary URL
     * 
     * @param imageUrl the full Cloudinary URL
     * @return the public ID
     */
    String extractPublicId(String imageUrl);
}
