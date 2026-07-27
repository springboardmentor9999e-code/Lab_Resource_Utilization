package com.labresource.dto.request;

import lombok.Data;

/**
 * Both fields are nullable on purpose: a request may toggle one channel without
 * having to restate the other.
 */
@Data
public class NotificationPreferencesUpdate {

    private Boolean smsEnabled;

    private Boolean pushEnabled;
}
