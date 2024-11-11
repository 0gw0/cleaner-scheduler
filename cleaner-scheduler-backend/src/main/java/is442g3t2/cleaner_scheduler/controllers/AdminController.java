package is442g3t2.cleaner_scheduler.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import is442g3t2.cleaner_scheduler.dto.admin.PostAdminRequest;
import is442g3t2.cleaner_scheduler.dto.admin.TerminateAdminRequest;
import is442g3t2.cleaner_scheduler.models.Admin;

import is442g3t2.cleaner_scheduler.repositories.AdminRepository;
import is442g3t2.cleaner_scheduler.services.WorkerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/admins")
public class AdminController {

    private final AdminRepository adminRepository;
    private final WorkerService workerService;


    public AdminController(AdminRepository adminRepository, WorkerService workerService) {
        this.adminRepository = adminRepository;
        this.workerService = workerService;
    }

    @Tag(name = "admins")
    @Operation(description = "GET ALL admins", summary = "GET ALL admins")
    @GetMapping("")
    public ResponseEntity<List<Admin>> getAdmins() {
        List<Admin> admins = adminRepository.findAll();
        return ResponseEntity.ok(admins);
    }

    @Tag(name = "admins")
    @Operation(description = "GET admin by admin id", summary = "GET admin by admin id")
    @GetMapping("/{id}")
    public ResponseEntity<Admin> getAdminById(@PathVariable Long id) {
        return adminRepository.findById(id).map(admin -> ResponseEntity.ok().body(admin))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Admin with id " + id + " not found"
                ));
    }

    @PostMapping("")
    public ResponseEntity<Admin> createAdmin(@RequestBody PostAdminRequest adminCreateDTO) {
        Admin admin = new Admin(adminCreateDTO.getName(), adminCreateDTO.getPassword(), adminCreateDTO.getEmail());
        Admin newAdmin = adminRepository.save(admin);
        return ResponseEntity.status(HttpStatus.CREATED).body(newAdmin);
    }

    @Tag(name = "admins")
    @Operation(description = "Terminate admin and reallocate workers", summary = "Terminate admin and reallocate workers")
    @DeleteMapping("/{id}/terminate")
    public ResponseEntity<Void> terminateAdmin( @PathVariable Long id, @RequestBody TerminateAdminRequest request) {
    
        Admin adminToTerminate = adminRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, 
                "Admin with id " + id + " not found"
            ));
        workerService.reallocateWorkers(id, request.getSupervisorId());

        adminRepository.delete(adminToTerminate);

        return ResponseEntity.noContent().build();
    }
}
