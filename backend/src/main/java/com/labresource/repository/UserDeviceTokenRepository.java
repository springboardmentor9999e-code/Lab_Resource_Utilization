package com.labresource.repository;

import com.labresource.entity.UserDeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDeviceTokenRepository extends JpaRepository<UserDeviceToken, Long> {

    List<UserDeviceToken> findByUser_UserId(Long userId);

    Optional<UserDeviceToken> findByToken(String token);

    void deleteByToken(String token);

    void deleteByTokenIn(List<String> tokens);
}
