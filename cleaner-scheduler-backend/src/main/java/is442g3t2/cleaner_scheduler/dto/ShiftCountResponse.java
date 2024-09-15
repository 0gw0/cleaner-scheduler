package is442g3t2.cleaner_scheduler.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Year;
import java.time.YearMonth;

@Setter
@Getter
public class ShiftCountResponse {
    private Long workerId;
    private int shiftCount;
    private YearMonth yearMonth;

    public ShiftCountResponse(Long workerId, int shiftCount) {
        this.workerId = workerId;
        this.shiftCount = shiftCount;
    }

    public ShiftCountResponse(Long workerId, int shiftCount, YearMonth yearMonth) {
        this.workerId = workerId;
        this.shiftCount = shiftCount;
        this.yearMonth = yearMonth;
    }
}