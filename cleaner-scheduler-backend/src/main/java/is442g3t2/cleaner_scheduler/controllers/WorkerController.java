package is442g3t2.cleaner_scheduler.controllers;

import is442g3t2.cleaner_scheduler.dto.AddShiftRequest;
import is442g3t2.cleaner_scheduler.dto.AddShiftResponse;
import is442g3t2.cleaner_scheduler.dto.GetShiftCountResponse;
import is442g3t2.cleaner_scheduler.dto.TakeLeaveRequest;
import is442g3t2.cleaner_scheduler.exceptions.ShiftsOverlapException;
import is442g3t2.cleaner_scheduler.models.Property;
import is442g3t2.cleaner_scheduler.models.leave.AnnualLeave;
import is442g3t2.cleaner_scheduler.models.leave.MedicalLeave;
import is442g3t2.cleaner_scheduler.models.Worker;
import is442g3t2.cleaner_scheduler.models.shift.Frequency;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.repositories.PropertyRepository;
import is442g3t2.cleaner_scheduler.repositories.WorkerRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;

@RestController()
@RequestMapping(path = "/workers")
public class WorkerController {

    private final WorkerRepository workerRepository;
    private final PropertyRepository propertyRepository;

    public WorkerController(WorkerRepository workerRepository, PropertyRepository propertyRepository) {
        this.workerRepository = workerRepository;
        this.propertyRepository = propertyRepository;
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
    public ResponseEntity<GetShiftCountResponse> getShiftCount(
            @PathVariable Long id,
            @RequestParam(required = false, name = "year") Integer year,
            @RequestParam(required = false, name = "month") Integer month) {

        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));

        if (year != null && month != null) {
            YearMonth yearMonth = YearMonth.of(year, month);
            int shiftCount = worker.getNumShiftsInMonth(yearMonth);
            return ResponseEntity.ok(new GetShiftCountResponse(id, shiftCount, yearMonth));
        } else if (year != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Year provided without month");
        } else if (month != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Month provided without year");
        } else {
            int shiftCount = worker.getShifts().size();
            return ResponseEntity.ok(new GetShiftCountResponse(id, shiftCount));
        }
    }

    @PostMapping("/{id}/shifts")
    public ResponseEntity<AddShiftResponse> addShifts(@Valid @RequestBody AddShiftRequest addShiftRequest, @PathVariable Long id) {

        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));
        Long propertyId = addShiftRequest.getPropertyId();
        Property property = propertyRepository.findById(propertyId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
        LocalDate startDate = addShiftRequest.getStartDate();
        LocalDate endDate = addShiftRequest.getEndDate();
        LocalTime startTime = addShiftRequest.getStartTime();
        LocalTime endTime = addShiftRequest.getEndTime();
        Frequency frequency = addShiftRequest.getFrequency();

        if (frequency != null && endDate == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new AddShiftResponse(false, "No End Date Provided"));
        }


        try {
            if (frequency == null) {
                // Single shift (adhoc eg when a new worker needs to takeover from another fella on leave)
                Shift shift = new Shift(startDate, startTime, endTime, property);
                worker.addShift(shift);
                workerRepository.save(worker);
                return ResponseEntity.ok(new AddShiftResponse(true, String.format("ONE Shift Added for %s from %s to %s", startDate, startTime, endTime)));

            } else {
                System.out.println(frequency);
                worker.addRecurringShifts(startDate, endDate, startTime, endTime, property, frequency);
                workerRepository.save(worker);
                return ResponseEntity.ok(new AddShiftResponse(true, String.format("RECURRING Shifts Added starting %s and ending %s from %s to %s", startDate, endDate, startTime, endTime)));
            }
        } catch (ShiftsOverlapException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new AddShiftResponse(false, e.getMessage()));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new AddShiftResponse(false, e.getMessage()));
        }
    }


    @PostMapping("/{id}/annual-leaves")
    public ResponseEntity<Worker> takeLeave(@PathVariable Long id,
                                            @RequestBody TakeLeaveRequest takeLeaveRequest) {
        LocalDate startDate = LocalDate.parse(takeLeaveRequest.getStartDate());
        LocalDate endDate = LocalDate.parse(takeLeaveRequest.getEndDate());
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
                                                   @RequestBody TakeLeaveRequest takeLeaveRequest) {
        LocalDate startDate = LocalDate.parse(takeLeaveRequest.getStartDate());
        LocalDate endDate = LocalDate.parse(takeLeaveRequest.getEndDate());
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
