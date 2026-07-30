package com.rems.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabRequest {
    @NotBlank(message = "Lab name is required")
    private String name;
}
