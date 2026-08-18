package com.lab.backend.controller;

import com.lab.backend.entity.WaitingList;
import com.lab.backend.service.WaitingListService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waiting-list")
@CrossOrigin(origins = "*")
public class WaitingListController {

    private final WaitingListService waitingListService;

    public WaitingListController(WaitingListService waitingListService) {
        this.waitingListService = waitingListService;
    }

    @PostMapping
    public ResponseEntity<WaitingList> addToWaitingList(@Valid @RequestBody WaitingList waitingList) {
        return ResponseEntity.ok(waitingListService.addToWaitingList(waitingList));
    }

    @GetMapping
    public ResponseEntity<List<WaitingList>> getWaitingList() {
        return ResponseEntity.ok(waitingListService.getWaitingList());
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<List<WaitingList>> getByUser(@PathVariable Long id) {
        return ResponseEntity.ok(waitingListService.getByUser(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<WaitingList> cancelWaiting(@PathVariable Long id) {
        return ResponseEntity.ok(waitingListService.cancelWaiting(id));
    }
}
