package is442g3t2.cleaner_scheduler.controllers;

import is442g3t2.cleaner_scheduler.models.Admin;

import is442g3t2.cleaner_scheduler.repositories.AdminRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/admins")
public class AdminController {

    private final AdminRepository adminRepository;


    public AdminController(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @GetMapping("")
    public ResponseEntity<List<Admin>> getAdmins() {
        List<Admin> admins = adminRepository.findAll();

        return ResponseEntity.ok(admins);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Admin> getAdminById(@PathVariable Long id) {
        return adminRepository.findById(id).map(admin -> ResponseEntity.ok().body(admin))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Admin with id " + id + " not found"
                ));
    }


}
