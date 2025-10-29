package com.connectexe.ConnectEXE.config;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class to load environment variables from .env file
 * This ensures that .env variables are available before Spring Boot starts
 */
@Configuration
public class DotenvConfig {

    private static final Logger logger = LoggerFactory.getLogger(DotenvConfig.class);

    @PostConstruct
    public void init() {
        try {
            logger.info("Loading environment variables from .env file...");
            
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")
                    .ignoreIfMissing()
                    .load();
            
            // Set environment variables to System properties
            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();
                
                // Only set if not already defined in system properties
                if (System.getProperty(key) == null) {
                    System.setProperty(key, value);
                    logger.debug("Loaded env variable: {} = {}", key, maskSensitive(key, value));
                }
            });
            
            logger.info("✅ Environment variables loaded successfully from .env file");
            
            // Verify Cloudinary credentials
            if (System.getProperty("CLOUDINARY_CLOUD_NAME") != null) {
                logger.info("✅ Cloudinary credentials found");
            } else {
                logger.warn("⚠️ Cloudinary credentials not found in .env file");
            }
            
        } catch (Exception e) {
            logger.warn("⚠️ Could not load .env file: {}. Using system environment variables.", e.getMessage());
        }
    }
    
    /**
     * Mask sensitive values in logs
     */
    private String maskSensitive(String key, String value) {
        if (key.contains("SECRET") || key.contains("PASSWORD") || key.contains("KEY")) {
            return value.substring(0, Math.min(4, value.length())) + "****";
        }
        return value;
    }
}
