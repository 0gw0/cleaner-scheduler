package is442g3t2.cleaner_scheduler.dto.shift.bulk;

import is442g3t2.cleaner_scheduler.models.shift.Frequency;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
public class BulkAddShiftRequest {
    @NotEmpty(message = "Worker IDs cannot be empty")
    private List<Long> workerIds;

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private Frequency frequency;

}