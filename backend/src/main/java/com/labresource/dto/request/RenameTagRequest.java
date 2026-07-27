package com.labresource.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Rename a tag across the whole catalog. If {@code to} is already present on an
 * asset the two tags collapse into one (tags are a deduped set per asset).
 */
@Data
public class RenameTagRequest {

    @NotBlank(message = "Source tag is required")
    private String from;

    @NotBlank(message = "Target tag is required")
    @Size(max = 50, message = "Tag must be at most 50 characters")
    private String to;
}
