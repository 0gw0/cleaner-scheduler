package is442g3t2.cleaner_scheduler.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import is442g3t2.cleaner_scheduler.repositories.AdminRepository;
import jakarta.websocket.server.PathParam;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping(path = "/shifts")
public class ShiftController {

    AdminRepository adminRepository;

    @GetMapping("/admin/{id}")
    public String getMethodName(@PathParam String id) {
        Admin admin = adminRepository.findById(id);
    }
    
}
