package com.lab.backend.controller;

import com.lab.backend.dto.UtilizationRequest;
import com.lab.backend.dto.UtilizationResponse;
import com.lab.backend.service.UtilizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/utilization")
@CrossOrigin(origins = "*")
public class UtilizationController {

    private final UtilizationService utilizationService;

    public UtilizationController(UtilizationService utilizationService) {
        this.utilizationService = utilizationService;
    }

    @PostMapping("/start")
    public ResponseEntity<UtilizationResponse> startUtilization(@RequestBody UtilizationRequest request) {
        return ResponseEntity.ok(utilizationService.startUtilization(request));
    }

    @PutMapping("/end/{id}")
    public ResponseEntity<UtilizationResponse> endUtilization(@PathVariable Long id) {
        return ResponseEntity.ok(utilizationService.endUtilization(id));
    }

    @GetMapping
    public ResponseEntity<List<UtilizationResponse>> getAllUtilization() {
        return ResponseEntity.ok(utilizationService.getAllUtilization());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UtilizationResponse> getUtilizationById(@PathVariable Long id) {
        return ResponseEntity.ok(utilizationService.getUtilizationById(id));
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<UtilizationResponse>> getUtilizationByEquipment(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(utilizationService.getUtilizationByEquipment(equipmentId));
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<UtilizationResponse>> getUtilizationByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(utilizationService.getUtilizationByDepartment(department));
    }

    @GetMapping("/overall")
    public ResponseEntity<Map<String, Object>> getOverallUtilization() {
        return ResponseEntity.ok(utilizationService.getOverallUtilization());
    }

    @GetMapping("/top-used")
    public ResponseEntity<List<Map<String, Object>>> getTopUsedEquipment() {
        return ResponseEntity.ok(utilizationService.getTopUsedEquipment());
    }
}
