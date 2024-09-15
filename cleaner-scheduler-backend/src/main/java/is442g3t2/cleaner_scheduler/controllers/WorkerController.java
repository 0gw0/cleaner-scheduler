package is442g3t2.cleaner_scheduler.controllers;

import is442g3t2.cleaner_scheduler.dto.LeaveRequest;
import is442g3t2.cleaner_scheduler.dto.ShiftCountResponse;
import is442g3t2.cleaner_scheduler.models.AnnualLeave;
import is442g3t2.cleaner_scheduler.models.MedicalLeave;
import is442g3t2.cleaner_scheduler.models.Worker;
import is442g3t2.cleaner_scheduler.repositories.WorkerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController()
@RequestMapping(path = "/workers")
public class WorkerController {

    private final WorkerRepository workerRepository;

    public WorkerController(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }


    @GetMapping("")
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

    @GetMapping("/{id}")
    public ResponseEntity<Worker> getWorkerById(@PathVariable Long id) {
        return workerRepository.findById(id)
                .map(worker -> ResponseEntity.ok().body(worker))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Worker with id " + id + " not found"));
    }

    @GetMapping("/{id}/shifts")
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

    @PostMapping("/{id}/annual-leaves")
    public ResponseEntity<Worker> takeLeave(@PathVariable Long id,
                                            @RequestBody LeaveRequest leaveRequest) {
        LocalDate startDate = LocalDate.parse(leaveRequest.getStartDate());
        LocalDate endDate = LocalDate.parse(leaveRequest.getEndDate());
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found")
        );

        worker.takeLeave(startDate, endDate);
        workerRepository.save(worker);
        return ResponseEntity.ok(worker);
    }

    @GetMapping("/{id}/annual-leaves")
    public ResponseEntity<List<AnnualLeave>> getWorkerLeaves(@PathVariable Long id) {
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found")
        );
        return ResponseEntity.ok(worker.getAnnualLeaves());
    }

    @GetMapping("/{id}/annual-leaves/{year}")
    public ResponseEntity<List<AnnualLeave>> getWorkerLeavesByYear(@PathVariable Long id, @PathVariable int year) {
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found")
        );
        return ResponseEntity.ok(worker.getAnnualLeavesByYear(year));
    }


    @GetMapping("/{id}/annual-leaves-days/{year}")
    public ResponseEntity<Long> getWorkerLeaveDaysByYear(@PathVariable Long id, @PathVariable int year) {
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found")
        );
        return ResponseEntity.ok(worker.getTotalAnnualLeavesTakenByYear(year));
    }

    @PostMapping("/{id}/medical-leaves")
    public ResponseEntity<Worker> takeMedicalLeave(@PathVariable Long id,
                                                   @RequestBody LeaveRequest leaveRequest) {
        LocalDate startDate = LocalDate.parse(leaveRequest.getStartDate());
        LocalDate endDate = LocalDate.parse(leaveRequest.getEndDate());
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found")
        );

        worker.takeMedicalLeave(startDate, endDate);
        workerRepository.save(worker);
        return ResponseEntity.ok(worker);
    }

    @GetMapping("/{id}/medical-leaves")
    public ResponseEntity<List<MedicalLeave>> getWorkerMedicalLeaves(@PathVariable Long id) {
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found")
        );
        return ResponseEntity.ok(worker.getMedicalLeaves());
    }

    @GetMapping("/{id}/medical-leaves/{year}")
    public ResponseEntity<List<MedicalLeave>> getWorkerMedicalLeavesByYear(@PathVariable Long id, @PathVariable int year) {
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found")
        );
        return ResponseEntity.ok(worker.getMedicalLeavesByYear(year));
    }


    @GetMapping("/{id}/medical-leaves-days/{year}")
    public ResponseEntity<Long> getWorkerMedicalLeaveDaysByYear(@PathVariable Long id, @PathVariable int year) {
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found")
        );
        return ResponseEntity.ok(worker.getTotalMedicalLeavesTakenByYear(year));
    }


}
