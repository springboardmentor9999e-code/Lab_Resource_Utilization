package com.example.hello.repository;
import com.example.hello.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionRepository extends JpaRepository<Institution, Integer> {

}