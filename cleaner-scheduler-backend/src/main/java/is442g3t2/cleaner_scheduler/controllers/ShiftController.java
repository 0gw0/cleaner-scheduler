package is442g3t2.cleaner_scheduler.controllers;

import com.google.maps.model.LatLng;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import is442g3t2.cleaner_scheduler.dto.shift.ShiftDTO;
import is442g3t2.cleaner_scheduler.dto.shift.UpdateShift;
import is442g3t2.cleaner_scheduler.dto.worker.FindClosestAvailableWorkersRequest;
import is442g3t2.cleaner_scheduler.dto.worker.FindClosestAvailableWorkersResponse;
import is442g3t2.cleaner_scheduler.exceptions.ShiftsOverlapException;
import is442g3t2.cleaner_scheduler.models.shift.*;
import is442g3t2.cleaner_scheduler.models.worker.Worker;
import is442g3t2.cleaner_scheduler.models.worker.WorkerWithTravelTime;
import is442g3t2.cleaner_scheduler.repositories.ShiftRepository;
import is442g3t2.cleaner_scheduler.repositories.WorkerRepository;
import is442g3t2.cleaner_scheduler.services.S3Service;
import is442g3t2.cleaner_scheduler.services.ShiftService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.annotation.processing.Completion;
import java.io.IOException;
import java.net.URL;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import static is442g3t2.cleaner_scheduler.models.property.Property.getCoordinatesFromPostalCode;
import static is442g3t2.cleaner_scheduler.models.worker.WorkerLocationFinder.findTopFiveClosestWorkers;
import static is442g3t2.cleaner_scheduler.models.worker.WorkerLocationFinder.getPostalCodeFromLocation;

@RestController
@RequestMapping(path = "/shifts")
public class ShiftController {


    private final WorkerRepository workerRepository;
    private final ShiftRepository shiftRepository;
    private final S3Service s3Service;
    private final ShiftService shiftService;

    public ShiftController(WorkerRepository workerRepository, ShiftRepository shiftRepository, S3Service s3Service, ShiftService shiftService) {
        this.workerRepository = workerRepository;
        this.shiftRepository = shiftRepository;
        this.s3Service = s3Service;
        this.shiftService = shiftService;
    }

    @PostMapping("/available-workers")
    @Tag(name = "shifts")
    @Operation(summary = "get 5 best workers for a shift", description = "get 5 best workers for a shift")
    public ResponseEntity<List<FindClosestAvailableWorkersResponse>> getClosestAvailableWorkers(
            @RequestBody FindClosestAvailableWorkersRequest request
    ) {

        String postalCode = request.getPostalCode();
        LatLng targetLocationLatLng = getCoordinatesFromPostalCode(postalCode);

        List<Worker> workers = workerRepository.findBySupervisor_Id(request.getSupervisorId());
        List<WorkerWithTravelTime> topFiveWorkers = findTopFiveClosestWorkers(
                targetLocationLatLng,
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                workers
        );

        List<FindClosestAvailableWorkersResponse> result = topFiveWorkers.stream()
                .map(wwtt -> {
                    Worker worker = wwtt.getWorker();
                    Shift shift = wwtt.getShift();
                    if (worker == null) {
                        System.err.println("Encountered null worker in WorkerWithTravelTime");
                        return null;
                    }
                    return new FindClosestAvailableWorkersResponse(
                            worker.getId(),
                            worker.getName(),
                            wwtt.getTravelTimeResult(),
                            shift != null ? new FindClosestAvailableWorkersResponse.ShiftInfo(shift.getDate(), shift.getStartTime(), shift.getEndTime()) : null,
                            getPostalCodeFromLocation(wwtt.getOriginLocation())
                    );
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        System.out.println("Result: " + result);

        return ResponseEntity.ok(result);
    }


    @Tag(name = "shifts")
    @Operation(description = "Get all shifts across all workers with optional filtering", summary = "Get all shifts with optional filters")
    @GetMapping
    public ResponseEntity<List<ShiftDTO>> getAllShifts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        List<Shift> shifts;

        if (status != null || year != null || month != null) {
            // Build dynamic query based on provided filters
            LocalDateTime startDate = null;
            LocalDateTime endDate = null;

            if (year != null && month != null) {
                startDate = LocalDateTime.of(year, month, 1, 0, 0);
                endDate = startDate.plusMonths(1);
            } else if (year != null) {
                startDate = LocalDateTime.of(year, 1, 1, 0, 0);
                endDate = startDate.plusYears(1);
            }

            shifts = shiftRepository.findByFilters(status, startDate, endDate);
        } else {
            shifts = shiftRepository.findAll();
        }

        List<ShiftDTO> shiftDTOs = shifts.stream()
                .map(shift -> new ShiftDTO(
                        shift,
                        getPresignedUrlsForImages(shift.getArrivalImages(), s3Service),
                        getPresignedUrlsForImages(shift.getCompletionImages(), s3Service)
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(shiftDTOs);
    }


    private List<String> getPresignedUrlsForImages(List<? extends Image> images, S3Service s3Service) {
        if (images == null || images.isEmpty()) {
            return new ArrayList<>();
        }

        return images.stream()
                .map(image -> {
                    try {
                        return s3Service.getPresignedUrl(image.getS3Key(), 3600).toString();
                    } catch (Exception e) {
                        System.err.println("Error generating presigned URL for image: " + e.getMessage());
                        return null;
                    }
                })
                .filter(url -> url != null)
                .collect(Collectors.toList());
    }

    private boolean filterByStatus(Shift shift, String status) {
        return status == null || status.isEmpty() || status.equalsIgnoreCase(String.valueOf(shift.getStatus()));
    }

    private boolean filterByYear(Shift shift, Integer year) {
        return year == null || shift.getDate().getYear() == year;
    }

    private boolean filterByMonth(Shift shift, Integer month) {
        return month == null || shift.getDate().getMonthValue() == month;
    }

    @Tag(name = "shifts", description = "Shift and Image Management APIs")
    @Operation(summary = "Upload arrival image", description = "Upload an arrival image for a specific shift")
    @PostMapping(value = "/{shiftId}/arrival-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadArrivalImage(
            @PathVariable Long shiftId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("workerId") Long workerId) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Please select a file to upload"));
            }

            // Validate file type
            if (!file.getContentType().startsWith("image/")) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Only image files are accepted"));
            }

            Shift shift = shiftRepository.findById(shiftId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Shift not found with id: " + shiftId));
            // Create a unique S3 key to prevent overwrites
            String s3Key = String.format("arrivals/%d/%s_%s%s",
                    shiftId,
                    UUID.randomUUID().toString(),
                    LocalDateTime.now().format(DateTimeFormatter.ISO_DATE),
                    getFileExtension(file.getOriginalFilename()));

            s3Service.saveToS3(s3Key, file.getInputStream(), file.getContentType());

            ArrivalImage arrivalImage = new ArrivalImage(s3Key, file.getOriginalFilename(), workerId);
            shift.addArrivalImage(arrivalImage);

            // Add worker to presentWorkers Set
            shift.getPresentWorkersAsSet().add(workerId);

            // As long as one worker present, shift status updated to In Progress
            shift.setStatus(ShiftStatus.IN_PROGRESS);

            // update all worker's status to in working once arrival image uploaded
            Optional<Worker> workerOptional = workerRepository.findById(workerId);
            Worker worker = workerOptional.get();
            worker.setStatus("In Working");
            workerRepository.save(worker);


            shift = shiftRepository.save(shift);

            // Get presigned URL for immediate access
            String presignedUrl = s3Service.getPresignedUrl(s3Key, 3600).toString();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Arrival image uploaded successfully");
            ShiftDTO shiftDTO = new ShiftDTO(
                    shift,
                    getPresignedUrlsForImages(shift.getArrivalImages(), s3Service),
                    getPresignedUrlsForImages(shift.getCompletionImages(), s3Service)
            );
            response.put("shift", shiftDTO);
            response.put("imageUrl", presignedUrl);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error uploading file: " + e.getMessage()));
        }
    }

    private String getFileExtension(String filename) {
        return Optional.ofNullable(filename)
                .filter(f -> f.contains("."))
                .map(f -> f.substring(f.lastIndexOf(".")))
                .orElse("");
    }

    @GetMapping("/{shiftId}/arrival-image")
    @Tag(name = "shifts", description = "Shift and Image Management APIs")
    @Operation(summary = "Get arrival image URL", description = "Get the URL of the arrival image for a specific shift")
    public ResponseEntity<?> getArrivalImageUrl(@PathVariable Long shiftId) {
        try {
            Optional<Shift> shiftOptional = shiftRepository.findById(shiftId);
            if (shiftOptional.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Error: Shift not found with id: " + shiftId));
            }
            Shift shift = shiftOptional.get();

            if (shift.getArrivalImages().isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Error: No arrival image found for shift with id: " + shiftId));
            }

            List<Map<String, String>> imageDetails = shift.getArrivalImages().stream()
                    .map(image -> {
                        Map<String, String> details = new HashMap<>();
                        try {
                            details.put("url", s3Service.getPresignedUrl(image.getS3Key(), 3600).toString());
                            details.put("fileName", image.getFileName());
                            details.put("uploadTime", image.getUploadTime().toString());
                            details.put("workerId", image.getWorkerId().toString());
                        } catch (Exception e) {
                            System.err.println("Error generating presigned URL for image: " + e.getMessage());
                        }
                        return details;
                    })
                    .filter(details -> !details.isEmpty())
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Arrival image URLs retrieved successfully");
            response.put("images", imageDetails);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    @Tag(name = "shifts", description = "Shift and Image Management APIs")
    @Operation(summary = "Upload completion image", description = "Upload a completion image for a specific shift")
    @PostMapping(value = "/{shiftId}/completion-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadCompletionImage(
            @PathVariable Long shiftId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("workerId") Long workerId) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Please select a file to upload"));
            }

            // Validate file type
            if (!file.getContentType().startsWith("image/")) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Only image files are accepted"));
            }

            Shift shift = shiftRepository.findById(shiftId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Shift not found with id: " + shiftId));

            // Create a unique S3 key to prevent overwrites
            String s3Key = String.format("completions/%d/%s_%s%s",
                    shiftId,
                    UUID.randomUUID().toString(),
                    LocalDateTime.now().format(DateTimeFormatter.ISO_DATE),
                    getFileExtension(file.getOriginalFilename()));

            s3Service.saveToS3(s3Key, file.getInputStream(), file.getContentType());

            CompletionImage completionImage = new CompletionImage(s3Key, file.getOriginalFilename(), workerId);
            shift.addCompletionImage(completionImage);

            // As long as one worker complete, shift status updated to Completed
            shift.setStatus(ShiftStatus.COMPLETED);

            // update all present worker's status back to Available once shift ends
            for (Worker worker: shift.getWorkers()) {
                if (shift.getPresentWorkers().contains(worker.getId())) {
                    worker.setStatus("Available");
                    workerRepository.save(worker);
                }
            }

            shift = shiftRepository.save(shift);

            // Get presigned URL for immediate access
            String presignedUrl = s3Service.getPresignedUrl(s3Key, 3600).toString();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Completion image uploaded successfully");
            ShiftDTO shiftDTO = new ShiftDTO(
                    shift,
                    getPresignedUrlsForImages(shift.getArrivalImages(), s3Service),
                    getPresignedUrlsForImages(shift.getCompletionImages(), s3Service)
            );
            response.put("shift", shiftDTO);
            response.put("imageUrl", presignedUrl);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error uploading file: " + e.getMessage()));
        }
    }


    @GetMapping("/{shiftId}/completion-image")
    @Tag(name = "shifts", description = "Shift and Image Management APIs")
    @Operation(summary = "Get completion image URL", description = "Get the URL of the completion image for a specific shift")
    public ResponseEntity<?> getCompletionImageUrl(@PathVariable Long shiftId) {
        try {
            Optional<Shift> shiftOptional = shiftRepository.findById(shiftId);
            if (shiftOptional.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Error: Shift not found with id: " + shiftId));
            }
            Shift shift = shiftOptional.get();

            if (shift.getCompletionImages().isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Error: No completion images found for shift with id: " + shiftId));
            }

            List<Map<String, Object>> imageDetails = shift.getCompletionImages().stream()
                    .map(image -> {
                        try {
                            Map<String, Object> details = new HashMap<>();
                            details.put("url", s3Service.getPresignedUrl(image.getS3Key(), 3600).toString());
                            details.put("fileName", image.getFileName());
                            details.put("uploadTime", image.getUploadTime());
                            details.put("workerId", image.getWorkerId());
                            return details;
                        } catch (Exception e) {
                            System.err.println("Error generating presigned URL for image: " + e.getMessage());
                            return null;
                        }
                    })
                    .filter(details -> details != null)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Completion image URLs retrieved successfully");
            response.put("images", imageDetails);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }


    @PutMapping("/{shiftId}/update")
    @Tag(name = "shifts", description = "Update workers, timing and dates of shifts")
    @Operation(summary = "Update workers, timing and dates of shifts", description = "Update workers, timing and dates for a specific shift")
    public ResponseEntity<ShiftDTO> updateShiftDetails(
            @PathVariable Long shiftId,
            @RequestBody UpdateShift updateRequest) {

        Shift updatedShift = shiftService.updateShiftDetails(
                shiftId,
                updateRequest.getWorkerIds(),
                updateRequest.getNewDate(),
                updateRequest.getNewStartTime(),
                updateRequest.getNewEndTime()
        );

        ShiftDTO shiftDTO = new ShiftDTO(
                updatedShift,
                getPresignedUrlsForImages(updatedShift.getArrivalImages(), s3Service),
                getPresignedUrlsForImages(updatedShift.getCompletionImages(), s3Service)
        );
        return ResponseEntity.ok(shiftDTO);
    }


    @PutMapping("/{shiftId}/update-status")
    @Tag(name = "shifts", description = "Update the status of a shift and/or present workers")
    @Operation(summary = "Update shift status and/or present workers", description = "Update the status for a specific shift and/or present workers")
    public ResponseEntity<?> updateShiftStatus(
            @PathVariable Long shiftId,
            @RequestParam(required = true) ShiftStatus status,
            @RequestParam(required = false) Set<Long> workerIds){
        
        Shift shift = shiftRepository.getReferenceById(shiftId);
        if (!workerIds.isEmpty() || !(workerIds == null)) {
            try {
                for (Long workerId : shift.getWorkerIds()) {
                    if (!shift.getPresentWorkersAsSet().contains(workerId)) {
                        shift.getPresentWorkersAsSet().add(workerId);
                        Worker worker = workerRepository.findById(workerId)
                            .orElseThrow(() -> new IllegalArgumentException("Worker with ID " + workerId + " not found."));
                        worker.setStatus("In Working");
                        workerRepository.save(worker);
                    }
                }
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(createErrorResponse("Failed to update present workers: " + e.getMessage()));
            }
        }

        if (status.getDisplayName() == "Completed") {
            for (Long workerId : shift.getPresentWorkersAsSet()) {
                Worker worker = workerRepository.findById(workerId)
                    .orElseThrow(() -> new IllegalArgumentException("Worker with ID " + workerId + " not found."));
                worker.setStatus("Available");
                workerRepository.save(worker);
            }
        }

        try {
            Shift updatedShift = shiftService.updateShiftStatus(shiftId, status);

            // Create a DTO or response based on your needs, or return a basic success message
            ShiftDTO shiftDTO = new ShiftDTO(
                    updatedShift,
                    getPresignedUrlsForImages(updatedShift.getArrivalImages(), s3Service),
                    getPresignedUrlsForImages(updatedShift.getCompletionImages(), s3Service)
            );
            return ResponseEntity.ok(shiftDTO);
        } catch (Exception e) {
            // Handle exceptions gracefully and return an error response if needed
            return ResponseEntity.badRequest().body(createErrorResponse("Failed to update shift status: " + e.getMessage()));
        }
    }

    private Map<String, String> createErrorResponse(String errorMessage) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", errorMessage);
        return errorResponse;
    }

    @Tag(name = "shifts")
    @Operation(description = "Get all rescheduled shifts with optional filters",
            summary = "get rescheduled shifts")
    @GetMapping("/rescheduled")
    public ResponseEntity<List<ShiftDTO>> getRescheduledShifts(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) Long workerId,
            @RequestParam(required = false) Boolean sortByOriginalDate) {

        // Get base list of shifts
        List<Shift> shifts = shiftRepository.findAll();

        List<ShiftDTO> rescheduledShifts = shifts.stream()
                .filter(Shift::isRescheduled)
                // Filter by date range if provided
                .filter(shift -> fromDate == null || !shift.getDate().isBefore(fromDate))
                .filter(shift -> toDate == null || !shift.getDate().isAfter(toDate))
                // Filter by worker if provided
                .filter(shift -> workerId == null ||
                        shift.getWorkers().stream()
                                .anyMatch(worker -> worker.getId().equals(workerId)))
                // Sort based on parameter (original or new date)
                .sorted((s1, s2) -> {
                    if (Boolean.TRUE.equals(sortByOriginalDate)) {
                        return s1.getOriginalDate().compareTo(s2.getOriginalDate());
                    }
                    return s1.getDate().compareTo(s2.getDate());
                })
                .map(shift -> new ShiftDTO(
                        shift,
                        getPresignedUrlsForImages(shift.getArrivalImages(), s3Service),
                        getPresignedUrlsForImages(shift.getCompletionImages(), s3Service)
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(rescheduledShifts);
    }

    @Tag(name = "shifts")
    @Operation(description = "Reschedule an existing shift", summary = "reschedule shift")
    @PutMapping("/{shiftId}/reschedule")
    public ResponseEntity<ShiftDTO> rescheduleShift(
            @PathVariable Long shiftId,
            @Valid @RequestBody RescheduleRequest rescheduleRequest) {

        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shift not found"));

        shift.setDate(rescheduleRequest.getDate());
        shift.setStartTime(rescheduleRequest.getStartTime());
        shift.setEndTime(rescheduleRequest.getEndTime());
        shift.setRescheduled(true);

        shift = shiftRepository.save(shift);
        return ResponseEntity.ok(new ShiftDTO(
                shift,
                getPresignedUrlsForImages(shift.getArrivalImages(), s3Service),
                getPresignedUrlsForImages(shift.getCompletionImages(), s3Service)
        ));
    }
}


