package com.connectexe.ConnectEXE.controller;

import com.connectexe.ConnectEXE.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for image upload operations using Cloudinary
 */
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(
    origins = {"http://localhost:3000", "http://localhost:5173"},
    allowCredentials = "true",
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class ImageUploadController {

    private final CloudinaryService cloudinaryService;

    /**
     * Upload single image
     * POST /api/upload/image
     */
    @PostMapping("/image")
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "connect-exe") String folder
    ) {
        try {
            log.info("📤 Uploading image: {} to folder: {}", file.getOriginalFilename(), folder);
            
            Map<String, Object> uploadResult = cloudinaryService.uploadImage(file, folder);
            
            // Extract important information
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Image uploaded successfully");
            response.put("url", uploadResult.get("secure_url"));
            response.put("publicId", uploadResult.get("public_id"));
            response.put("format", uploadResult.get("format"));
            response.put("width", uploadResult.get("width"));
            response.put("height", uploadResult.get("height"));
            response.put("size", uploadResult.get("bytes"));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to upload image: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to upload image");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Delete image by public ID
     * DELETE /api/upload/image/{publicId}
     */
    @DeleteMapping("/image")
    public ResponseEntity<Map<String, Object>> deleteImage(
            @RequestParam("publicId") String publicId
    ) {
        try {
            log.info("🗑️ Deleting image with public ID: {}", publicId);
            
            Map<String, Object> deleteResult = cloudinaryService.deleteImage(publicId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Image deleted successfully");
            response.put("result", deleteResult.get("result"));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Failed to delete image: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to delete image");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Health check endpoint
     * GET /api/upload/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "Image Upload Service");
        response.put("message", "Cloudinary integration is working");
        return ResponseEntity.ok(response);
    }
}
