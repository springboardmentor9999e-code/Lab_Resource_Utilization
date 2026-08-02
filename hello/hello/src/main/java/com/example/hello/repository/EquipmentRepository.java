package com.example.hello.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.hello.entity.Equipment;

public interface EquipmentRepository extends JpaRepository<Equipment, Integer> {

}