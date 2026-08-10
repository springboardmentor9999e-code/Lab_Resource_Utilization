package com.example.backend.controller;

import com.example.backend.entity.WaitingList;
import com.example.backend.service.WaitingListService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waiting-list")
@CrossOrigin(origins = "http://localhost:3000")
public class WaitingListController {

    private final WaitingListService waitingListService;

    public WaitingListController(
            WaitingListService waitingListService
    ) {
        this.waitingListService = waitingListService;
    }

    @PostMapping("/join")
    public ResponseEntity<WaitingList> joinWaitingList(
            @RequestParam Integer userId,
            @RequestParam Integer equipmentId
    ) {

        return ResponseEntity.ok(
                waitingListService.joinWaitingList(
                        userId,
                        equipmentId
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<WaitingList>>
    getAllRequests() {

        return ResponseEntity.ok(
                waitingListService.getAllRequests()
        );
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<WaitingList>>
    getEquipmentQueue(
            @PathVariable Integer equipmentId
    ) {

        return ResponseEntity.ok(
                waitingListService.getEquipmentQueue(
                        equipmentId
                )
        );
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<WaitingList> acceptRequest(
            @PathVariable Integer id
    ) {

        return ResponseEntity.ok(
                waitingListService.acceptRequest(id)
        );
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<WaitingList> rejectRequest(
            @PathVariable Integer id
    ) {

        return ResponseEntity.ok(
                waitingListService.rejectRequest(id)
        );
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<WaitingList> cancelRequest(
            @PathVariable Integer id
    ) {

        return ResponseEntity.ok(
                waitingListService.cancelRequest(id)
        );
    }
}