package is442g3t2.cleaner_scheduler.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import is442g3t2.cleaner_scheduler.dto.leave.AnnualLeaveDTO;
import is442g3t2.cleaner_scheduler.dto.leave.MedicalLeaveDTO;
import is442g3t2.cleaner_scheduler.dto.shift.AddShiftRequest;
import is442g3t2.cleaner_scheduler.dto.shift.AddShiftResponse;
import is442g3t2.cleaner_scheduler.dto.shift.GetShiftCountResponse;
import is442g3t2.cleaner_scheduler.dto.shift.ShiftDTO;
import is442g3t2.cleaner_scheduler.dto.shift.bulk.BulkAddShiftRequest;
import is442g3t2.cleaner_scheduler.dto.shift.bulk.BulkAddShiftResponse;
import is442g3t2.cleaner_scheduler.dto.worker.PostWorkerRequest;
import is442g3t2.cleaner_scheduler.dto.worker.UpdateWorker;
import is442g3t2.cleaner_scheduler.dto.worker.TakeLeaveRequest;
import is442g3t2.cleaner_scheduler.dto.worker.WorkerDTO;
import is442g3t2.cleaner_scheduler.exceptions.ShiftsOverlapException;
import is442g3t2.cleaner_scheduler.models.leave.MedicalCertificate;
import is442g3t2.cleaner_scheduler.models.property.Property;
import is442g3t2.cleaner_scheduler.models.leave.AnnualLeave;
import is442g3t2.cleaner_scheduler.models.leave.MedicalLeave;
import is442g3t2.cleaner_scheduler.models.shift.ShiftStatus;
import is442g3t2.cleaner_scheduler.models.worker.Worker;
import is442g3t2.cleaner_scheduler.models.Admin;
import is442g3t2.cleaner_scheduler.models.shift.Frequency;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.repositories.*;
import is442g3t2.cleaner_scheduler.services.S3Service;
import is442g3t2.cleaner_scheduler.services.WorkerService;
import is442g3t2.cleaner_scheduler.services.EmailSenderService;
import jakarta.validation.Valid;
import org.antlr.v4.runtime.misc.LogManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import is442g3t2.cleaner_scheduler.dto.leave.UpdateAnnualLeaveRequest;
import is442g3t2.cleaner_scheduler.models.leave.LeaveStatus;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;


@RestController()
@RequestMapping(path = "/workers")
public class WorkerController {

    private final MedicalLeaveRepository medicalLeaveRepository;
    private final AnnualLeaveRepository annualLeaveRepository;
    private final ShiftRepository shiftRepository;
    private final WorkerRepository workerRepository;
    private final PropertyRepository propertyRepository;
    private final AdminRepository adminRepository;
    private final WorkerService workerService;
    private final EmailSenderService emailSenderService;
    private final S3Service s3Service;

    public WorkerController(
            MedicalLeaveRepository medicalLeaveRepository, AnnualLeaveRepository annualLeaveRepository, ShiftRepository shiftRepository, WorkerService workerService, WorkerRepository workerRepository,
            AdminRepository adminRepository, PropertyRepository propertyRepository
            , EmailSenderService emailSenderService, S3Service s3Service
    ) {
        this.medicalLeaveRepository = medicalLeaveRepository;
        this.annualLeaveRepository = annualLeaveRepository;
        this.shiftRepository = shiftRepository;
        this.workerService = workerService;
        this.workerRepository = workerRepository;
        this.adminRepository = adminRepository;
        this.propertyRepository = propertyRepository;
        this.emailSenderService = emailSenderService;
        this.s3Service = s3Service;
    }

    @Tag(name = "workers")
    @Operation(description = "get ALL workers or ALL workers under a supervisor using their supervisor id", summary = "get ALL workers or ALL workers under a superviser using their supervisor id")
    @GetMapping("")
    public ResponseEntity<List<WorkerDTO>> getWorkers(
            @RequestParam(name = "supervisorId", required = false) Long supervisorId) {
        List<Worker> workers = supervisorId == null ? workerService.getAllWorkers()
                : workerService.getWorkersBySupervisorId(supervisorId);

        if (workers.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        List<WorkerDTO> workerDTOs = workers.stream()
                .map(worker -> new WorkerDTO(worker, s3Service)).distinct()
                .collect(Collectors.toList());

        return ResponseEntity.ok(workerDTOs);
    }

    @Tag(name = "workers")
    @Operation(description = "get worker by worker id", summary = "get worker by worker id")
    @GetMapping("/{id}")
    public ResponseEntity<WorkerDTO> getWorkerById(@PathVariable Long id) {
        return workerRepository.findById(id)
                .map(worker -> ResponseEntity.ok().body(new WorkerDTO(worker, s3Service)))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Worker with id " + id + " not found"));
    }

    @Tag(name = "workers - shifts")
    @Operation(description = "get all shift and total shift count of a worker by worker id or with the specific YEAR AND MONTH", summary = "get all shift and total shift count of a worker by worker id or with the specific YEAR AND MONTH")
    @GetMapping("/{id}/shifts")
    public ResponseEntity<GetShiftCountResponse> getShiftCount(
            @PathVariable Long id,
            @RequestParam(required = false, name = "status") String status,
            @RequestParam(required = false, name = "year") Integer year,
            @RequestParam(required = false, name = "month") Integer month) {

        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));

        List<Shift> shifts = new ArrayList<>(worker.getShifts());

        if (year != null && month != null) {
            YearMonth yearMonth = YearMonth.of(year, month);
            int shiftCount = worker.getNumShiftsInMonth(yearMonth);
            shifts = shifts.stream()
                    .filter(shift -> {
                        LocalDate shiftDate = shift.getDate();
                        return shiftDate.getYear() == year &&
                                shiftDate.getMonthValue() == month;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new GetShiftCountResponse(id, shiftCount, yearMonth, shifts));
        } else if (year != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Year provided without month");
        } else if (month != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Month provided without year");
        } else {
            int shiftCount = worker.getShifts().size();
            return ResponseEntity.ok(new GetShiftCountResponse(id, shiftCount, shifts));
        }
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

        if (!property.isActive()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new AddShiftResponse(false, "Cannot create shift for inactive property"));
        }
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
                System.out.println("THIS IS THE NEW SHIFT" + shift);
                worker.addShift(shift);
                shiftRepository.save(shift);
                workerRepository.save(worker);
                System.out.println("ALL SHIFTS SHOWN HERE: " + worker.getShifts());

                return ResponseEntity.ok(new AddShiftResponse(true,
                        String.format("ONE Shift Added for %s from %s to %s", startDate, startTime, endTime)));
            } else {
                List<Shift> recurringShifts = worker.addRecurringShifts(startDate, endDate, startTime, endTime,
                        property, frequency);
                shiftRepository.saveAll(recurringShifts);
                workerRepository.save(worker);
                return ResponseEntity.ok(new AddShiftResponse(true,
                        String.format("RECURRING Shifts Added starting %s and ending %s from %s to %s",
                                startDate, endDate, startTime, endTime)));
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

    @Tag(name = "workers - shifts")
    @Operation(description = "add shift(s) to multiple workers", summary = "bulk add shift(s) to workers")
    @PostMapping("/bulk/shifts")
    public ResponseEntity<BulkAddShiftResponse> addBulkShifts(
            @Valid @RequestBody BulkAddShiftRequest bulkAddShiftRequest) {

        Property property = propertyRepository.findById(bulkAddShiftRequest.getPropertyId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        if (!property.isActive()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new BulkAddShiftResponse(false, "Cannot create shifts for inactive property", Map.of()));
        }

        if (bulkAddShiftRequest.getFrequency() != null && bulkAddShiftRequest.getEndDate() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new BulkAddShiftResponse(false, "No End Date Provided", Map.of()));
        }

        // Create or get existing shifts
        List<Shift> shifts = new ArrayList<>();
        if (bulkAddShiftRequest.getFrequency() == null) {
            // Single shift - check if it exists
            Shift existingShift = shiftRepository.findByDateAndStartTimeAndEndTimeAndProperty(
                    bulkAddShiftRequest.getStartDate(),
                    bulkAddShiftRequest.getStartTime(),
                    bulkAddShiftRequest.getEndTime(),
                    property
            ).orElse(null);

            if (existingShift == null) {
                existingShift = new Shift(
                        bulkAddShiftRequest.getStartDate(),
                        bulkAddShiftRequest.getStartTime(),
                        bulkAddShiftRequest.getEndTime(),
                        property,
                        ShiftStatus.UPCOMING
                );
                shiftRepository.save(existingShift);
            }
            shifts.add(existingShift);
        } else {
            // Create recurring shifts
            LocalDate currentDate = bulkAddShiftRequest.getStartDate();
            while (!currentDate.isAfter(bulkAddShiftRequest.getEndDate())) {
                // Check if shift exists for this date
                Shift existingShift = shiftRepository.findByDateAndStartTimeAndEndTimeAndProperty(
                        currentDate,
                        bulkAddShiftRequest.getStartTime(),
                        bulkAddShiftRequest.getEndTime(),
                        property
                ).orElse(null);

                if (existingShift == null) {
                    existingShift = new Shift(
                            currentDate,
                            bulkAddShiftRequest.getStartTime(),
                            bulkAddShiftRequest.getEndTime(),
                            property,
                            ShiftStatus.UPCOMING
                    );
                    shiftRepository.save(existingShift);
                }
                shifts.add(existingShift);

                currentDate = currentDate.plus(
                        bulkAddShiftRequest.getFrequency().getInterval(),
                        bulkAddShiftRequest.getFrequency().getUnit()
                );
            }
        }

        Map<Long, String> failedWorkers = new HashMap<>();
        int successCount = 0;

        // Now assign workers to the shifts
        for (Long workerId : bulkAddShiftRequest.getWorkerIds()) {
            try {
                Worker worker = workerRepository.findById(workerId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Worker not found with ID: " + workerId));

                // Try to add all shifts to this worker
                for (Shift shift : shifts) {
                    try {
                        worker.addShift(shift);
                    } catch (ShiftsOverlapException e) {
                        throw new ShiftsOverlapException("Worker " + worker.getName() + ": " + e.getMessage());
                    }
                }

                workerRepository.save(worker);
                successCount++;

            } catch (ShiftsOverlapException e) {
                failedWorkers.put(workerId, "Shifts overlap: " + e.getMessage());
            } catch (Exception e) {
                failedWorkers.put(workerId, "Error: " + e.getMessage());
            }
        }

        // Final save to ensure all relationships are updated
        shiftRepository.saveAll(shifts);

        String message = String.format("Successfully added shifts to %d out of %d workers",
                successCount, bulkAddShiftRequest.getWorkerIds().size());

        if (failedWorkers.isEmpty()) {
            return ResponseEntity.ok(new BulkAddShiftResponse(true, message, failedWorkers));
        } else {
            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .body(new BulkAddShiftResponse(false, message, failedWorkers));
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
    @Operation(description = "Update the status of an annual leave", summary = "Update the status of an annual leave")
    @PatchMapping("/{workerId}/annual-leaves/{leaveId}")
    public ResponseEntity<AnnualLeave> updateAnnualLeaveStatus(
            @PathVariable Long workerId,
            @PathVariable Long leaveId,
            @RequestBody @Valid UpdateAnnualLeaveRequest updateAnnualLeaveRequest) {

        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));

        AnnualLeave annualLeave = worker.getAnnualLeaves().stream()
                .filter(leave -> leave.getId().equals(leaveId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annual leave not found"));

        LeaveStatus newStatus = updateAnnualLeaveRequest.getStatus();
        if (newStatus == LeaveStatus.APPROVED || newStatus == LeaveStatus.REJECTED) {
            annualLeave.setStatus(newStatus.name());
            worker = workerRepository.save(worker);
            return ResponseEntity.ok(annualLeave);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid leave status");
        }
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
    @Operation(description = "take medical leave for a worker with worker id with START DATE, END DATE and optional MC PDF",
            summary = "take medical leave for a worker with worker id with START DATE, END DATE and optional MC PDF")
    @PostMapping(value = "/{id}/medical-leaves", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<WorkerDTO> takeMedicalLeave(
            @PathVariable Long id,
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr,
            @RequestParam(value = "medicalCertificate", required = false) MultipartFile medicalCertificate) {

        if (medicalCertificate != null && !medicalCertificate.getContentType().equals("application/pdf")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF files are accepted");
        }

        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = LocalDate.parse(endDateStr);
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));

        try {
            MedicalLeave medicalLeave = new MedicalLeave(worker, startDate, endDate);

            if (medicalCertificate != null && !medicalCertificate.isEmpty()) {
                String s3Key = String.format("medical-certificates/%d_%s_%s.pdf",
                        worker.getId(),
                        startDate.toString(),
                        UUID.randomUUID().toString());

                s3Service.saveToS3(s3Key, medicalCertificate.getInputStream(), medicalCertificate.getContentType());

                MedicalCertificate mc = new MedicalCertificate(s3Key, medicalCertificate.getOriginalFilename());
                medicalLeave.setMedicalCertificate(mc);
            }

            // Update worker schedule
            workerService.removeAllShiftsByWorkerIdByDate(worker, startDate, endDate);
            worker.takeMedicalLeave(medicalLeave);

            workerRepository.save(worker);
            WorkerDTO workerDTO = new WorkerDTO(worker, s3Service);
            return ResponseEntity.ok(workerDTO);

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to process medical certificate", e);
        }
    }

    @Tag(name = "workers - medical leaves")
    @Operation(description = "get ALL medical leaves for a worker with worker id", summary = "get ALL medical leaves for a worker with worker id")
    @GetMapping("/{id}/medical-leaves")
    public ResponseEntity<List<MedicalLeaveDTO>> getWorkerMedicalLeaves(@PathVariable Long id) {
        Worker worker = workerRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));

        // Convert each MedicalLeave to MedicalLeaveDTO
        List<MedicalLeaveDTO> medicalLeaveDTOs = worker.getMedicalLeaves().stream()
                .map(medicalLeave -> new MedicalLeaveDTO(
                        medicalLeave,
                        medicalLeave.getMedicalCertificate() != null
                                ? s3Service.getPresignedUrl(medicalLeave.getMedicalCertificate().getS3Key(), 3600).toString()
                                : null
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(medicalLeaveDTOs);
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
    public ResponseEntity<List<ShiftDTO>> getShiftsBySupervisorId(@PathVariable Long supervisorId) {
        List<ShiftDTO> shiftDTOs = workerService.getAllShiftsBySupervisorId(supervisorId)
                .stream()
                .map(shift -> new ShiftDTO(shift,
                        shift.getArrivalImage() != null
                                ? s3Service.getPresignedUrl(shift.getArrivalImage().getS3Key(), 3600).toString()
                                : null))
                .collect(Collectors.toList());


        if (shiftDTOs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(shiftDTOs);
    }

    @Tag(name = "workers")
    @Operation(description = "Create a new worker", summary = "Create a new worker")
    @PostMapping("")
    public ResponseEntity<Worker> createWorker(@RequestBody PostWorkerRequest postWorkerRequest) {

        if (workerRepository.existsByEmail(postWorkerRequest.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        
        Worker worker = new Worker(
                postWorkerRequest.getName(),
                postWorkerRequest.getPhoneNumber(),
                postWorkerRequest.getBio(),
                postWorkerRequest.getEmail(),
                postWorkerRequest.getPassword()
                );

        Admin supervisor = adminRepository.findById(postWorkerRequest.getSupervisorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supervisor not found"));
        worker.setSupervisor(supervisor);
        String token = UUID.randomUUID().toString();

        worker.setEmail(postWorkerRequest.getEmail());
        worker.setVerificationToken(token);
        workerRepository.save(worker);

        emailSenderService.sendVerificationEmail(postWorkerRequest.getEmail(), token);

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

    @Tag(name = "workers")
    @Operation(description = "Update worker's details by Id", summary = "Update worker's details by Id")
    @PatchMapping("/{id}")
    public ResponseEntity<Worker> updateWorker(@PathVariable Long id, @RequestBody UpdateWorker UpdateWorker) {
        Worker updatedWorker = workerService.updateWorker(id, UpdateWorker);
        return ResponseEntity.ok(updatedWorker);
    }

    // @Tag(name = "workers")
    // @Operation(description = "Send registration email to new worker", summary = "Send registration email to new worker")
    // @PostMapping("/auth/register")
    // public ResponseEntity<String> registerWorker(@RequestParam String email) {
    //     String token = UUID.randomUUID().toString();
    //     Worker newWorker = new Worker();
    //     newWorker.setEmail(email);
    //     newWorker.setVerificationToken(token);
    //     workerRepository.save(newWorker);

    //     emailSenderService.sendVerificationEmail(email, token);

    //     return ResponseEntity.ok("Verification email sent to " + email);
    // }

    @Tag(name = "workers")
    @Operation(description = "Verify new worker", summary = "Verify new worker")
    @GetMapping("/verify")
    public ResponseEntity<String> verifyUser(@RequestParam String token) {
        Optional<Worker> workerOptional = workerRepository.findByVerificationToken(token);

        if (workerOptional.isPresent()) {
            Worker newWorker = workerOptional.get();
            newWorker.setIsVerified(true);
            newWorker.setVerificationToken(null);
            workerRepository.save(newWorker);
            return ResponseEntity.ok("User verified successfully!");
        } else {
            return ResponseEntity.badRequest().body("Invalid verification token");
        }
    }

    @Tag(name = "workers - availability")
    @Operation(description = "Get all available workers at a specific date and time",
            summary = "get available workers")
    @GetMapping("/available")
    public ResponseEntity<List<WorkerDTO>> getAvailableWorkers(
            @RequestParam LocalDate date,
            @RequestParam LocalTime startTime,
            @RequestParam LocalTime endTime,
            @RequestParam(required = false) Long supervisorId) {

        // temporary shift object JUST TOI CHECK overlap
        Shift tempShift = new Shift(date, startTime, endTime, null, ShiftStatus.UPCOMING);

        List<Worker> allWorkers = workerRepository.findAll();

        // Filter available workers
        List<WorkerDTO> availableWorkers = allWorkers.stream()
                .filter(worker -> {
                    boolean noShiftConflict = worker.isNewShiftValid(tempShift);

                    boolean noLeaveConflict =
                            worker.getAnnualLeavesByYear(date.getYear()).stream()
                                    .noneMatch(leave ->
                                            !date.isBefore(leave.getStartDate()) &&
                                                    !date.isAfter(leave.getEndDate())) &&
                                    worker.getMedicalLeavesByYear(date.getYear()).stream()
                                            .noneMatch(leave ->
                                                    !date.isBefore(leave.getStartDate()) &&
                                                            !date.isAfter(leave.getEndDate()));

                    return noShiftConflict && noLeaveConflict && worker.getStatus().equals("Active");
                })
                // Filter by supervisor if supervisorId is provided
                .filter(worker -> supervisorId == null ||
                        (worker.getSupervisor() != null &&
                                worker.getSupervisor().equals(supervisorId)))
                .map(worker -> new WorkerDTO(worker, s3Service))
                .collect(Collectors.toList());

        return ResponseEntity.ok(availableWorkers);
    }

    @Tag(name = "workers - leaves")
    @Operation(description = "Update annual leave approval status", summary = "approve/reject annual leave")
    @PutMapping("/{workerId}/annual-leaves/{leaveId}")
    public ResponseEntity<AnnualLeaveDTO> updateAnnualLeaveStatus(
            @PathVariable Long workerId,
            @PathVariable Long leaveId,
            @RequestParam boolean approved) {

        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));

        AnnualLeave leave = annualLeaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Annual leave not found"));

        if (!leave.getWorker().getId().equals(workerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Leave does not belong to this worker");
        }

        leave.setApproved(approved);
        leave.setStatus(approved ? "APPROVED" : "REJECTED");
        leave = annualLeaveRepository.save(leave);

        return ResponseEntity.ok(new AnnualLeaveDTO(leave));
    }

    @Tag(name = "workers - leaves")
    @Operation(description = "Update medical leave approval status", summary = "approve/reject medical leave")
    @PutMapping("/{workerId}/medical-leaves/{leaveId}")
    public ResponseEntity<MedicalLeaveDTO> updateMedicalLeaveStatus(
            @PathVariable Long workerId,
            @PathVariable Long leaveId,
            @RequestParam boolean approved) {

        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));

        MedicalLeave leave = medicalLeaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medical leave not found"));

        if (!leave.getWorker().getId().equals(workerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Leave does not belong to this worker");
        }

        leave.setApproved(approved);
        leave = medicalLeaveRepository.save(leave);

        String presignedUrl = null;
        if (leave.getMedicalCertificate() != null) {
            try {
                presignedUrl = s3Service.getPresignedUrl(leave.getMedicalCertificate().getS3Key(), 3600).toString();
            } catch (Exception e) {
                // continue
            }
        }

        return ResponseEntity.ok(new MedicalLeaveDTO(leave, presignedUrl));
    }

}
