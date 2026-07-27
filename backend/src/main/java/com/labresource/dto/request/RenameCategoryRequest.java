package com.labresource.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Rename a category across the whole catalog. If {@code to} already exists,
 * the two categories are merged (every asset in {@code from} moves to {@code to}).
 */
@Data
public class RenameCategoryRequest {

    @NotBlank(message = "Source category is required")
    private String from;

    @NotBlank(message = "Target category is required")
    @Size(max = 100, message = "Category name must be at most 100 characters")
    private String to;
}
