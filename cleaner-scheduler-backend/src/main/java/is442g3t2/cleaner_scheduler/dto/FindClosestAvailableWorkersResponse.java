package is442g3t2.cleaner_scheduler.dto;

import is442g3t2.cleaner_scheduler.models.TravelTime;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class FindClosestAvailableWorkersResponse {
    private Long id;
    private String name;
    private TravelTime travelTimeToTarget;
    private ShiftInfo relevantShift;
    private String originLocation;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @ToString
    public static class ShiftInfo {
        private LocalDate date;
        private LocalTime startTime;
        private LocalTime endTime;
    }
}
