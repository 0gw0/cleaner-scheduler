package is442g3t2.cleaner_scheduler.models.shift;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RescheduleRequest {
    @NotNull(message = "New date is required")
    private LocalDate date;

    @NotNull(message = "New start time is required")
    private LocalTime startTime;

    @NotNull(message = "New end time is required")
    private LocalTime endTime;
}