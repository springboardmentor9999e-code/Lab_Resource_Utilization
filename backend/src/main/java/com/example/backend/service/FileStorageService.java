package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadPath;

    public FileStorageService(
            @Value("${file.upload-dir}") String uploadDir
    ) {

        this.uploadPath =
                Paths.get(uploadDir)
                        .toAbsolutePath()
                        .normalize();

        try {

            Files.createDirectories(uploadPath);
            Files.createDirectories(
                    uploadPath.resolve("images")
            );
            Files.createDirectories(
                    uploadPath.resolve("documents")
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Could not create upload folders",
                    e
            );
        }
    }


    public String saveImage(
            MultipartFile file
    ) throws IOException {

        String fileName =
                UUID.randomUUID()
                        + "_"
                        + file.getOriginalFilename();

        Path filePath =
                uploadPath
                        .resolve("images")
                        .resolve(fileName);

        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );

        return "/uploads/images/" + fileName;
    }


    public String saveDocument(
            MultipartFile file
    ) throws IOException {

        String fileName =
                UUID.randomUUID()
                        + "_"
                        + file.getOriginalFilename();

        Path filePath =
                uploadPath
                        .resolve("documents")
                        .resolve(fileName);

        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );

        return "/uploads/documents/" + fileName;
    }
}