package com.labresource.backend.controller;

import com.labresource.backend.entity.Resource;
import com.labresource.backend.service.ResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // Get all resources
    @GetMapping
    public List<Resource> getAllResources() {
        return resourceService.getAllResources();
    }

    // Get resource by ID
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {

        return ResponseEntity.ok(
                resourceService.getResourceById(id)
        );
    }

    // Add resource
    @PostMapping
    public ResponseEntity<Resource> addResource(
            @RequestBody Resource resource) {

        return ResponseEntity.ok(
                resourceService.saveResource(resource)
        );
    }

    // Update resource
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(
            @PathVariable Long id,
            @RequestBody Resource resource) {

        return ResponseEntity.ok(
                resourceService.updateResource(id, resource)
        );
    }

    // Delete resource
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteResource(
            @PathVariable Long id) {

        resourceService.deleteResource(id);

        return ResponseEntity.ok("Resource deleted successfully");
    }
}