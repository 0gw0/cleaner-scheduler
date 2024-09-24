package is442g3t2.cleaner_scheduler.controllers;

import com.google.maps.model.LatLng;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import is442g3t2.cleaner_scheduler.dto.FindClosestAvailableWorkersRequest;
import is442g3t2.cleaner_scheduler.dto.FindClosestAvailableWorkersResponse;
import is442g3t2.cleaner_scheduler.models.Worker;
import is442g3t2.cleaner_scheduler.models.WorkerWithTravelTime;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.repositories.WorkerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static is442g3t2.cleaner_scheduler.models.Property.getCoordinatesFromPostalCode;
import static is442g3t2.cleaner_scheduler.models.WorkerLocationFinder.findTopFiveClosestWorkers;
import static is442g3t2.cleaner_scheduler.models.WorkerLocationFinder.getPostalCodeFromLocation;

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

}
