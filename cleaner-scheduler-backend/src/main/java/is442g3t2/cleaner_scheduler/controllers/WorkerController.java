package is442g3t2.cleaner_scheduler.controllers;

import is442g3t2.cleaner_scheduler.dto.ShiftCountResponse;
import is442g3t2.cleaner_scheduler.models.Worker;
import is442g3t2.cleaner_scheduler.repositories.WorkerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
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

    @GetMapping("/workers/{id}/shifts")
    public ResponseEntity<ShiftCountResponse> getShiftCount(
            @PathVariable Long id,
            @RequestParam(required = false, name = "year") Integer year,
            @RequestParam(required = false, name = "month") Integer month) {

        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));

        if (year != null && month != null) {
            YearMonth yearMonth = YearMonth.of(year, month);
            int shiftCount = worker.getNumShiftsInMonth(yearMonth);
            return ResponseEntity.ok(new ShiftCountResponse(id, shiftCount, yearMonth));
        } else if (year != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Year provided without month");
        } else if (month != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Month provided without year");
        } else {
            int shiftCount = worker.getShifts().size();
            return ResponseEntity.ok(new ShiftCountResponse(id, shiftCount));
        }
    }

}
