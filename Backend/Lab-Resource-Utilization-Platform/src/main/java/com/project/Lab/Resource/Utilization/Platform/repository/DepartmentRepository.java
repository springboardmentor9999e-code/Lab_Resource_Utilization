package com.project.Lab.Resource.Utilization.Platform.repository;

import com.project.Lab.Resource.Utilization.Platform.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Integer> {

    @Query(value = """
            SELECT
                d.department_name,
                COUNT(e.equipment_id)
            FROM departments d
            LEFT JOIN equipment e
                ON d.department_id = e.department_id
            GROUP BY d.department_name
            ORDER BY d.department_name
            """, nativeQuery = true)
    List<Object[]> getDepartmentStatistics();

}