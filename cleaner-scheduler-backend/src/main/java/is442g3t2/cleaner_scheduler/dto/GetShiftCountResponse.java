package is442g3t2.cleaner_scheduler.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.YearMonth;

@Setter
@Getter
public class GetShiftCountResponse {
    private Long workerId;
    private int shiftCount;
    private YearMonth yearMonth;

    public GetShiftCountResponse(Long workerId, int shiftCount) {
        this.workerId = workerId;
        this.shiftCount = shiftCount;
    }

    public GetShiftCountResponse(Long workerId, int shiftCount, YearMonth yearMonth) {
        this.workerId = workerId;
        this.shiftCount = shiftCount;
        this.yearMonth = yearMonth;
    }
}