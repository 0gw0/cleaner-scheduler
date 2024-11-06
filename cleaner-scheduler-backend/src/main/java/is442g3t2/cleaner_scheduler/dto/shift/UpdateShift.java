package is442g3t2.cleaner_scheduler.dto.shift;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Setter
@Getter
public class UpdateShift {
    private List<Long> workerIds;
    private LocalDate newDate;
    private LocalTime newStartTime;
    private LocalTime newEndTime;
}
