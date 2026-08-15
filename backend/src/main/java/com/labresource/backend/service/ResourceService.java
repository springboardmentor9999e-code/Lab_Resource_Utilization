package com.labresource.backend.service;

import com.labresource.backend.entity.Resource;
import com.labresource.backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    // Get all resources
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    // Get resource by ID
    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    // Save resource
    public Resource saveResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    // Update resource
    public Resource updateResource(Long id, Resource resource) {

        Resource existingResource = getResourceById(id);

        existingResource.setResourceName(resource.getResourceName());
        existingResource.setResourceType(resource.getResourceType());
        existingResource.setDescription(resource.getDescription());
        existingResource.setQuantity(resource.getQuantity());
        existingResource.setStatus(resource.getStatus());

        return resourceRepository.save(existingResource);
    }

    // Delete resource
    public void deleteResource(Long id) {

        Resource existingResource = getResourceById(id);

        resourceRepository.delete(existingResource);
    }
}