package is442g3t2.cleaner_scheduler.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import is442g3t2.cleaner_scheduler.dto.shift.AddShiftRequest;
import is442g3t2.cleaner_scheduler.dto.shift.AddShiftResponse;
import is442g3t2.cleaner_scheduler.dto.shift.GetShiftCountResponse;
import is442g3t2.cleaner_scheduler.dto.worker.PostWorkerRequest;
import is442g3t2.cleaner_scheduler.dto.worker.TakeLeaveRequest;
import is442g3t2.cleaner_scheduler.exceptions.ShiftsOverlapException;
import is442g3t2.cleaner_scheduler.models.property.Property;
import is442g3t2.cleaner_scheduler.models.leave.AnnualLeave;
import is442g3t2.cleaner_scheduler.models.leave.MedicalLeave;
import is442g3t2.cleaner_scheduler.models.shift.ShiftStatus;
import is442g3t2.cleaner_scheduler.models.worker.Worker;
import is442g3t2.cleaner_scheduler.models.Admin;
import is442g3t2.cleaner_scheduler.models.shift.Frequency;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.repositories.AdminRepository;
import is442g3t2.cleaner_scheduler.repositories.PropertyRepository;
import is442g3t2.cleaner_scheduler.repositories.WorkerRepository;
import is442g3t2.cleaner_scheduler.services.WorkerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController()
@RequestMapping(path = "/workers")
public class WorkerController {

    private final WorkerRepository workerRepository;
    private final PropertyRepository propertyRepository;
    private final AdminRepository adminRepository;
    private final WorkerService workerService;

    public WorkerController(WorkerService workerService, WorkerRepository workerRepository,
            AdminRepository adminRepository, PropertyRepository propertyRepository) {
        this.workerService = workerService;
        this.workerRepository = workerRepository;
        this.adminRepository = adminRepository;
        this.propertyRepository = propertyRepository;
    }

    @Tag(name = "workers")
    @Operation(description = "get ALL workers or ALL workers under a superviser using their supervisor id", summary = "get ALL workers or ALL workers under a superviser using their supervisor id")
    @GetMapping("")
    public ResponseEntity<List<Worker>> getWorkers(
            @RequestParam(name = "supervisorId", required = false) Long supervisorId) {
        List<Worker> workers = supervisorId == null ? workerService.getAllWorkers()
                : workerService.getWorkersBySupervisorId(supervisorId);

        // if (supervisorId == null) {
        // workers = workerRepository.findAll();
        // } else {
        // workers = workerRepository.findBySupervisor_Id(supervisorId);
        // }

        if (workers.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(workers);
    }

    @Tag(name = "workers")
    @Operation(description = "get worker by worker id", summary = "get worker by worker id")
    @GetMapping("/{id}")
    public ResponseEntity<Worker> getWorkerById(@PathVariable Long id) {
        return workerRepository.findById(id)
                .map(worker -> ResponseEntity.ok().body(worker))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Worker with id " + id + " not found"));
    }

    @Tag(name = "workers - shifts")
    @Operation(description = "get total shift count of a worker by worker id or with the specific YEAR AND MONTH", summary = "get  total shift count of a worker by worker id or with the specific YEAR AND MONTH")
    @GetMapping("/{id}/shifts")
    public ResponseEntity<GetShiftCountResponse> getShiftCount(
            @PathVariable Long id,
            @RequestParam(required = false, name = "status") String status,
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

    @Tag(name = "workers - shifts")
    @Operation(description = "get ALL shifts of a worker by worker id or with the specific YEAR AND MONTH", summary = "get ALL shifts of a worker by worker id or with the specific YEAR AND MONTH")
    @GetMapping("/{id}/allshifts")
    public ResponseEntity<List<Shift>> getShift(
            @PathVariable Long id,
            @RequestParam(required = false, name = "status") String status,
            @RequestParam(required = false, name = "year") Integer year,
            @RequestParam(required = false, name = "month") Integer month) {

        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));

        List<Shift> shifts = new ArrayList<>(worker.getShifts());

        if (year != null && month != null) {
            shifts = shifts.stream()
                    .filter(shift -> {
                        LocalDate shiftDate = shift.getDate(); // Assuming there's a getDate() method
                        return shiftDate.getYear() == year &&
                                shiftDate.getMonthValue() == month;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(shifts);
        } else if (year != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Year provided without month");
        } else if (month != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Month provided without year");
        }
        
        return ResponseEntity.ok(shifts);
    }

    @Tag(name = "workers - shifts")
    @Operation(description = "add shift(s) to a worker", summary = "add shift(s) to a worker")
    @PostMapping("/{id}/shifts")
    public ResponseEntity<AddShiftResponse> addShifts(@Valid @RequestBody AddShiftRequest addShiftRequest,
            @PathVariable Long id) {

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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AddShiftResponse(false, "No End Date Provided"));
        }

        try {
            if (frequency == null) {
                // Single shift (adhoc eg when a new worker needs to takeover from another fella
                // on leave)
                Shift shift = new Shift(startDate, startTime, endTime, property, ShiftStatus.UPCOMING);
                worker.addShift(shift);
                workerRepository.save(worker);

                return ResponseEntity.ok(new AddShiftResponse(true,
                        String.format("ONE Shift Added for %s from %s to %s", startDate, startTime, endTime)));
            } else {
                System.out.println(frequency);
                worker.addRecurringShifts(startDate, endDate, startTime, endTime, property, frequency);
                workerRepository.save(worker);
                return ResponseEntity.ok(new AddShiftResponse(true,
                        String.format("RECURRING Shifts Added starting %s and ending %s from %s to %s", startDate,
                                endDate, startTime, endTime)));
            }
        } catch (ShiftsOverlapException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new AddShiftResponse(false, e.getMessage()));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AddShiftResponse(false, e.getMessage()));
        }
    }

    @Tag(name = "workers - annual leaves")
    @Operation(description = "take annual leave for a worker with worker id with START DATE AND END DATE", summary = "take annual leave for a worker with worker id with START DATE AND END DATE")
    @PostMapping("/{id}/annual-leaves")
    public ResponseEntity<Worker> takeLeave(@PathVariable Long id,
            @RequestBody TakeLeaveRequest takeLeaveRequest) {
        LocalDate startDate = LocalDate.parse(takeLeaveRequest.getStartDate());
        LocalDate endDate = LocalDate.parse(takeLeaveRequest.getEndDate());
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));
        
        workerService.removeAllShiftsByWorkerIdByDate(worker, startDate, endDate);
        worker.takeLeave(startDate, endDate);
        workerRepository.save(worker);
        return ResponseEntity.ok(worker);
    }

    @Tag(name = "workers - annual leaves")
    @Operation(description = "get ALL annual leaves for a worker with worker id", summary = "get ALL annual leaves for a worker with worker id")
    @GetMapping("/{id}/annual-leaves")
    public ResponseEntity<List<AnnualLeave>> getWorkerLeaves(@PathVariable Long id) {
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));
        return ResponseEntity.ok(worker.getAnnualLeaves());
    }

    @Tag(name = "workers - annual leaves")
    @Operation(description = "get ALL annual leaves for a worker with worker id in A SPECIFIC YEAR", summary = "get ALL annual leaves for a worker with worker id in A SPECIFIC YEAR")
    @GetMapping("/{id}/annual-leaves/{year}")
    public ResponseEntity<List<AnnualLeave>> getWorkerLeavesByYear(@PathVariable Long id, @PathVariable int year) {
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));
        return ResponseEntity.ok(worker.getAnnualLeavesByYear(year));
    }

    @Tag(name = "workers - annual leaves")
    @Operation(description = "get NUMBER OF DAYS of annual leaves taken for a worker with worker id in A SPECIFIC YEAR", summary = "get NUMBER OF DAYS of annual leaves taken for a worker with worker id in A SPECIFIC YEAR")
    @GetMapping("/{id}/annual-leaves-days/{year}")
    public ResponseEntity<Long> getWorkerLeaveDaysByYear(@PathVariable Long id, @PathVariable int year) {
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));
        return ResponseEntity.ok(worker.getTotalAnnualLeavesTakenByYear(year));
    }

    @Tag(name = "workers - medical leaves")
    @Operation(description = "take medical leave for a worker with worker id with START DATE AND END DATE", summary = "take medical leave for a worker with worker id with START DATE AND END DATE")
    @PostMapping("/{id}/medical-leaves")
    public ResponseEntity<Worker> takeMedicalLeave(@PathVariable Long id,
            @RequestBody TakeLeaveRequest takeLeaveRequest) {
        LocalDate startDate = LocalDate.parse(takeLeaveRequest.getStartDate());
        LocalDate endDate = LocalDate.parse(takeLeaveRequest.getEndDate());
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));
        
        workerService.removeAllShiftsByWorkerIdByDate(worker, startDate, endDate);
        worker.takeMedicalLeave(startDate, endDate);
        workerRepository.save(worker);
        return ResponseEntity.ok(worker);
    }

    @Tag(name = "workers - medical leaves")
    @Operation(description = "get ALL medical leaves for a worker with worker id", summary = "get ALL medical leaves for a worker with worker id")
    @GetMapping("/{id}/medical-leaves")
    public ResponseEntity<List<MedicalLeave>> getWorkerMedicalLeaves(@PathVariable Long id) {
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));
        return ResponseEntity.ok(worker.getMedicalLeaves());
    }

    @Tag(name = "workers - medical leaves")
    @Operation(description = "get ALL medical leaves for a worker with worker id in A SPECIFIC YEAR", summary = "get ALL medical leaves for a worker with worker id in A SPECIFIC YEAR")
    @GetMapping("/{id}/medical-leaves/{year}")
    public ResponseEntity<List<MedicalLeave>> getWorkerMedicalLeavesByYear(@PathVariable Long id,
            @PathVariable int year) {
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));
        return ResponseEntity.ok(worker.getMedicalLeavesByYear(year));
    }

    @Tag(name = "workers - medical leaves")
    @Operation(description = "get NUMBER OF DAYS of medical leaves taken for a worker with worker id in A SPECIFIC YEAR", summary = "get NUMBER OF DAYS of medical leaves taken for a worker with worker id in A SPECIFIC YEAR")
    @GetMapping("/{id}/medical-leaves-days/{year}")
    public ResponseEntity<Long> getWorkerMedicalLeaveDaysByYear(@PathVariable Long id, @PathVariable int year) {
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));
        return ResponseEntity.ok(worker.getTotalMedicalLeavesTakenByYear(year));
    }

    @Tag(name = "workers - shifts")
    @Operation(description = "get ALL shifts of all workers under a supervisor", summary = "get ALL shifts by supervisor ID")
    @GetMapping("/supervisor/{supervisorId}/shifts")
    public ResponseEntity<List<Shift>> getShiftsBySupervisorId(@PathVariable Long supervisorId) {
        List<Shift> shifts = workerService.getAllShiftsBySupervisorId(supervisorId);

        if (shifts.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(shifts);
    }

    @Tag(name = "workers")
    @Operation(description = "Create a new worker", summary = "Create a new worker")
    @PostMapping("")
    public ResponseEntity<Worker> createWorker(@RequestBody PostWorkerRequest postWorkerRequest) {
        Worker worker = new Worker(
                postWorkerRequest.getName(),
                postWorkerRequest.getPhoneNumber(),
                postWorkerRequest.getBio());

        Admin supervisor = adminRepository.findById(postWorkerRequest.getSupervisorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supervisor not found"));
        worker.setSupervisor(supervisor);

        Worker savedWorker = workerRepository.save(worker);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedWorker);
    }

    @Tag(name = "workers - shifts")
    @Operation(description = "delete a shift from a worker", summary = "delete a shift from a worker")
    @DeleteMapping("/{workerId}/shifts/{shiftId}")
    public ResponseEntity<?> deleteShift(@PathVariable Long workerId, @PathVariable Long shiftId) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Worker with id " + workerId + " not found"));
        Shift shiftToRemove = worker.getShifts().stream()
                .filter(shift -> shift.getId().equals(shiftId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Shift with id " + shiftId + " not found for worker " + workerId));
        try {
            worker.removeShift(shiftToRemove);
            workerRepository.save(worker);
            return ResponseEntity.ok(workerRepository.save(worker));
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Error removing shift: " + e.getMessage());
        }
    }

}
