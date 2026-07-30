package com.labhub.service;

import com.labhub.dto.rolerequest.RoleRequestCreate;
import com.labhub.dto.rolerequest.RoleRequestResponse;

import java.util.List;
import java.util.UUID;

public interface RoleRequestService {
    RoleRequestResponse submit(RoleRequestCreate request, String email);
    List<RoleRequestResponse> getAll();
    List<RoleRequestResponse> getMyRequests(String email);
    RoleRequestResponse approve(UUID id, String reviewerEmail);
    RoleRequestResponse reject(UUID id, String reviewerEmail, String reason);
}
