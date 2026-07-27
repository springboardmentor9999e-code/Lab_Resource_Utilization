package com.labresource.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Stores uploaded files on the local disk under {app.upload.dir}/{subDir}.
 * Files are served back via /uploads/** (see WebConfig resource handler).
 * Swap this implementation for S3/Cloudinary at deployment time.
 */
@Service
@Slf4j
public class FileStorageService {

    private static final Set<String> IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif");

    private static final Set<String> DOCUMENT_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
            "application/msword",                                                      // doc
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",       // xlsx
            "application/vnd.ms-excel",                                                // xls
            "text/plain",
            "image/jpeg", "image/png");

    private final Path rootDir;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.rootDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + this.rootDir, e);
        }
    }

    public String storeImage(MultipartFile file, String subDir) {
        validate(file, IMAGE_TYPES, "Only JPG, PNG, WEBP or GIF images are allowed");
        return store(file, subDir);
    }

    public String storeDocument(MultipartFile file, String subDir) {
        validate(file, DOCUMENT_TYPES, "Only PDF, DOC(X), XLS(X), TXT or image files are allowed");
        return store(file, subDir);
    }

    public void delete(String relativeUrl) {
        try {
            // relativeUrl looks like /uploads/equipment/3/abc.png -> strip the /uploads/ prefix
            String relative = relativeUrl.replaceFirst("^/uploads/", "");
            Path target = rootDir.resolve(relative).normalize();
            if (target.startsWith(rootDir)) {
                Files.deleteIfExists(target);
            }
        } catch (IOException e) {
            log.warn("Could not delete file {}: {}", relativeUrl, e.getMessage());
        }
    }

    private void validate(MultipartFile file, Set<String> allowedTypes, String message) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Uploaded file is empty");
        }
        if (!allowedTypes.contains(file.getContentType())) {
            throw new RuntimeException(message);
        }
    }

    private String store(MultipartFile file, String subDir) {
        try {
            Path dir = rootDir.resolve(subDir).normalize();
            if (!dir.startsWith(rootDir)) {
                throw new RuntimeException("Invalid upload path");
            }
            Files.createDirectories(dir);

            String original = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
            String ext = original.contains(".")
                    ? original.substring(original.lastIndexOf('.'))
                    : "";
            String storedName = UUID.randomUUID() + ext;

            Path target = dir.resolve(storedName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // URL path served by the static resource handler
            return "/uploads/" + subDir.replace('\\', '/') + "/" + storedName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }
}
