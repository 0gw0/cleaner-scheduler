package is442g3t2.cleaner_scheduler.controllers;

import com.google.maps.model.LatLng;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import is442g3t2.cleaner_scheduler.dto.shift.ShiftDTO;
import is442g3t2.cleaner_scheduler.dto.shift.UpdateShift;
import is442g3t2.cleaner_scheduler.dto.worker.FindClosestAvailableWorkersRequest;
import is442g3t2.cleaner_scheduler.dto.worker.FindClosestAvailableWorkersResponse;
import is442g3t2.cleaner_scheduler.models.shift.ArrivalImage;
import is442g3t2.cleaner_scheduler.models.worker.Worker;
import is442g3t2.cleaner_scheduler.models.worker.WorkerWithTravelTime;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.repositories.ShiftRepository;
import is442g3t2.cleaner_scheduler.repositories.WorkerRepository;
import is442g3t2.cleaner_scheduler.services.S3Service;
import is442g3t2.cleaner_scheduler.services.ShiftService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URL;
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

        System.out.println("REQUEST RECEIVED");
        String postalCode = request.getPostalCode();
        LatLng targetLocationLatLng = getCoordinatesFromPostalCode(postalCode);

        List<Worker> workers = workerRepository.findAll();
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

        List<Worker> allWorkers = workerRepository.findAll();
        List<Shift> allShifts = allWorkers.stream()
                .flatMap(worker -> worker.getShifts().stream())
                .toList();

        List<ShiftDTO> filteredShifts = allShifts.stream()
                .filter(shift -> filterByStatus(shift, status))
                .filter(shift -> filterByYear(shift, year))
                .filter(shift -> filterByMonth(shift, month))
                .distinct()
                .map(shift -> new ShiftDTO(shift,
                        shift.getArrivalImage() != null
                                ? s3Service.getPresignedUrl(shift.getArrivalImage().getS3Key(), 3600).toString()
                                : null))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredShifts);
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

    @PostMapping("/{shiftId}/arrival-image")
    @Tag(name = "shifts", description = "Shift and Image Management APIs")
    @Operation(summary = "Upload arrival image", description = "Upload an arrival image for a specific shift")
    public ResponseEntity<?> uploadArrivalImage(
            @PathVariable Long shiftId,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Error: Please select a file to upload"));
            }

            Optional<Shift> shiftOptional = shiftRepository.findById(shiftId);
            if (shiftOptional.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Error: Shift not found with id: " + shiftId));
            }
            Shift shift = shiftOptional.get();

            String s3Key = "arrivals/" + shiftId + "/" + file.getOriginalFilename();
            s3Service.saveToS3(s3Key, file.getInputStream(), file.getContentType());

            ArrivalImage arrivalImage = new ArrivalImage(s3Key, file.getOriginalFilename());
            shift.setArrivalImage(arrivalImage);

            shiftRepository.save(shift);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Arrival image uploaded successfully");
            response.put("shift", shift);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error uploading file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
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

            if (shift.getArrivalImage() == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Error: No arrival image found for shift with id: " + shiftId));
            }

            URL presignedUrl = s3Service.getPresignedUrl(shift.getArrivalImage().getS3Key(), 3600); // URL valid for 1 hour

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Arrival image URL retrieved successfully");
            response.put("url", presignedUrl.toString());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    @PutMapping("/{shiftId}/update")
    @Tag(name = "shifts", description = "Update workers, timing and dates of shifts")
    @Operation(summary = "Update shift URL", description = "Update workers, timing and dates for a specific shift")
    public ResponseEntity<Shift> updateShiftDetails(
            @PathVariable Long shiftId,
            @RequestBody UpdateShift updateRequest) {

        Shift updatedShift = shiftService.updateShiftDetails(
                shiftId,
                updateRequest.getWorkerIds(),
                updateRequest.getNewDate(),
                updateRequest.getNewStartTime(),
                updateRequest.getNewEndTime()
        );
        return ResponseEntity.ok(updatedShift);
    }

    private Map<String, String> createErrorResponse(String errorMessage) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", errorMessage);
        return errorResponse;
    }


}
