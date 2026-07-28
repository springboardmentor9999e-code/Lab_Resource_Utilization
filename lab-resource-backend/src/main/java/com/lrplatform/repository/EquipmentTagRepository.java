package com.lrplatform.repository;

import com.lrplatform.model.entity.EquipmentTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentTagRepository extends JpaRepository<EquipmentTag, Long> {

    Optional<EquipmentTag> findByTagNameIgnoreCase(String tagName);

    @Query("SELECT t FROM EquipmentTag t WHERE LOWER(t.tagName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<EquipmentTag> searchByTagName(@Param("query") String query);

    List<EquipmentTag> findByTagNameContainingIgnoreCase(String tagName);
}
