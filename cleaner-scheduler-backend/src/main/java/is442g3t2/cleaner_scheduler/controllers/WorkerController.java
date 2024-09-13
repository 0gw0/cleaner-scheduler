package is442g3t2.cleaner_scheduler.controllers;

import is442g3t2.cleaner_scheduler.models.Worker;
import is442g3t2.cleaner_scheduler.repositories.WorkerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.NoSuchElementException;

@RestController()
public class WorkerController {

    private final WorkerRepository workerRepository;

    public WorkerController(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }


    @GetMapping("/workers")
    public ResponseEntity<List<Worker>> getWorkers(@RequestParam(name = "supervisorId", required = false) Long supervisorId) {
        List<Worker> workers;

        if (supervisorId == null) {
            workers = workerRepository.findAll();
        } else {
            workers = workerRepository.findBySupervisorId(supervisorId);
        }

        if (workers.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(workers);
    }

    @GetMapping("/workers/{id}")
    public ResponseEntity<Worker> getWorkerById(@PathVariable Long id) {
        return workerRepository.findById(id)
                .map(worker -> ResponseEntity.ok().body(worker))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Worker with id " + id + " not found"));
    }


}
