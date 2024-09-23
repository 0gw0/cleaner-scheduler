package is442g3t2.cleaner_scheduler.controllers;

import com.google.maps.model.LatLng;
import is442g3t2.cleaner_scheduler.dto.FindClosestAvailableWorkersRequest;
import is442g3t2.cleaner_scheduler.dto.FindClosestAvailableWorkersResponse;
import is442g3t2.cleaner_scheduler.models.Worker;
import is442g3t2.cleaner_scheduler.models.WorkerWithTravelTime;
import is442g3t2.cleaner_scheduler.repositories.WorkerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

import static is442g3t2.cleaner_scheduler.models.Property.getCoordinatesFromPostalCode;
import static is442g3t2.cleaner_scheduler.models.WorkerLocationFinder.findTopFiveClosestWorkers;

@RestController
@RequestMapping(path = "/shifts")
public class ShiftController {


    private final WorkerRepository workerRepository;

    public ShiftController(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }

    @PostMapping("/available-workers")
    public ResponseEntity<List<FindClosestAvailableWorkersResponse>> getClosestAvailableWorkers(
            @RequestBody FindClosestAvailableWorkersRequest request
    ) {
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
                .map(wwtt -> new FindClosestAvailableWorkersResponse(
                        wwtt.getWorker().getId(),
                        wwtt.getWorker().getName(),
                        wwtt.getTravelTimeToTarget(),
                        wwtt.getShift(),
                        wwtt.getOriginLocation()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

}
