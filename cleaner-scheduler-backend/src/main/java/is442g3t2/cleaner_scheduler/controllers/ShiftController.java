package is442g3t2.cleaner_scheduler.controllers;

import com.google.maps.model.LatLng;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import is442g3t2.cleaner_scheduler.dto.worker.FindClosestAvailableWorkersRequest;
import is442g3t2.cleaner_scheduler.dto.worker.FindClosestAvailableWorkersResponse;
import is442g3t2.cleaner_scheduler.models.worker.Worker;
import is442g3t2.cleaner_scheduler.models.worker.WorkerWithTravelTime;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.repositories.WorkerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static is442g3t2.cleaner_scheduler.models.property.Property.getCoordinatesFromPostalCode;
import static is442g3t2.cleaner_scheduler.models.worker.WorkerLocationFinder.findTopFiveClosestWorkers;
import static is442g3t2.cleaner_scheduler.models.worker.WorkerLocationFinder.getPostalCodeFromLocation;

@RestController
@RequestMapping(path = "/shifts")
public class ShiftController {


    private final WorkerRepository workerRepository;

    public ShiftController(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }

    @PostMapping("/available-workers")
    @Tag(name = "shifts")
    @Operation(summary = "get 5 best workers for a shift", description = "get 5 best workers for a shift")
    public ResponseEntity<List<FindClosestAvailableWorkersResponse>> getClosestAvailableWorkers(
            @RequestBody FindClosestAvailableWorkersRequest request
    ) {
        String postalCode = request.getPostalCode();
        LatLng targetLocationLatLng = getCoordinatesFromPostalCode(postalCode);

        System.out.println(targetLocationLatLng);

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
    public ResponseEntity<List<Shift>> getAllShifts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        List<Worker> allWorkers = workerRepository.findAll();
        List<Shift> allShifts = allWorkers.stream()
                .flatMap(worker -> worker.getShifts().stream())
                .toList();

        List<Shift> filteredShifts = allShifts.stream()
                .filter(shift -> filterByStatus(shift, status))
                .filter(shift -> filterByYear(shift, year))
                .filter(shift -> filterByMonth(shift, month))
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

}
