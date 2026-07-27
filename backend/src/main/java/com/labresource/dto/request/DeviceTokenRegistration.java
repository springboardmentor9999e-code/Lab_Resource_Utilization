package com.labresource.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DeviceTokenRegistration {

    @NotBlank(message = "Device token is required")
    @Size(max = 512, message = "Device token is too long")
    private String token;

    /** WEB | ANDROID | IOS. Defaults to WEB when omitted. */
    @Size(max = 20)
    private String platform;
}
