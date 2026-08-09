package com.labresource.platform.repository;

import com.labresource.platform.entity.Lab;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LabRepository extends JpaRepository<Lab, Long> {

    boolean existsByName(String name);

    long countByActiveTrue();

    List<Lab> findByActiveTrue();
}
