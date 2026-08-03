package com.labresource.dto;

import com.labresource.entity.ProfileType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    private Long institutionId;
    private ProfileType profileType;
}