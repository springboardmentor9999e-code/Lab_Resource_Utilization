    package com.lab.backend.controller;

    import com.lab.backend.entity.Equipment;
    import com.lab.backend.enums.EquipmentStatus;
    import com.lab.backend.service.EquipmentService;

    import jakarta.validation.Valid;

    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("/api/equipment")
    @CrossOrigin(origins = "*")
    public class EquipmentController {

        private final EquipmentService equipmentService;

        public EquipmentController(EquipmentService equipmentService) {
            this.equipmentService = equipmentService;
        }

        // Add Equipment
        @PostMapping
        public ResponseEntity<Equipment> addEquipment(
                @Valid @RequestBody Equipment equipment) {

            return ResponseEntity.ok(
                    equipmentService.addEquipment(equipment)
            );
        }

        // Get All Equipment with Optional Search & Filters
        @GetMapping
        public ResponseEntity<List<Equipment>> getAllEquipment(
                @RequestParam(required = false) String name,
                @RequestParam(required = false) Long laboratoryId,
                @RequestParam(required = false) String category,
                @RequestParam(required = false) EquipmentStatus status) {

            if (name != null || laboratoryId != null || category != null || status != null) {
                return ResponseEntity.ok(
                        equipmentService.searchAndFilterEquipment(name, laboratoryId, category, status)
                );
            }

            return ResponseEntity.ok(
                    equipmentService.getAllEquipment()
            );
        }

        // Get Equipment By ID
        @GetMapping("/{id}")
        public ResponseEntity<Equipment> getEquipmentById(
                @PathVariable Long id) {

            return ResponseEntity.ok(equipmentService.getEquipmentById(id));
        }

        // Update Equipment
        @PutMapping("/{id}")
        public ResponseEntity<Equipment> updateEquipment(
                @PathVariable Long id,
                @Valid @RequestBody Equipment equipment) {

            return ResponseEntity.ok(equipmentService.updateEquipment(id, equipment));
        }

        // Delete Equipment
        @DeleteMapping("/{id}")
        public ResponseEntity<String> deleteEquipment(
                @PathVariable Long id) {

            return ResponseEntity.ok(
                    equipmentService.deleteEquipment(id)
            );
        }
    }