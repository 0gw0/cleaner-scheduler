package is442g3t2.cleaner_scheduler.dto.worker;

import is442g3t2.cleaner_scheduler.models.shift.TravelTime;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class WorkerTravelTimeResponse {
    private Long id;
    private String name;
    private TravelTime travelTimeToTarget;
    private FindClosestAvailableWorkersResponse.ShiftInfo relevantShift;
    private String originLocation;
    private String unavailabilityReason;
    private boolean canMakeIt;

}
