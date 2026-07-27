package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * One row of the equipment category taxonomy — powers the Category Manager UI.
 *
 * A category is "seeded" when it comes from the platform's default vocabulary
 * rather than from equipment actually registered under it. Seeded categories
 * with no equipment cannot be deleted (there is nothing to delete) but are
 * still offered when cataloguing new assets.
 */
@Data
@Builder
public class CategoryStatsResponse {
    private String name;
    private long equipmentCount;
    private boolean seeded;
}
