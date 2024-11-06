package is442g3t2.cleaner_scheduler.dto.shift;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

import java.time.YearMonth;

import is442g3t2.cleaner_scheduler.models.shift.Shift;

@Setter
@Getter
public class GetShiftCountResponse {
    private Long workerId;
    private int shiftCount;
    private YearMonth yearMonth;
    private List<Shift> shifts;

    public GetShiftCountResponse(Long workerId, int shiftCount, List<Shift> shifts) {
        this.workerId = workerId;
        this.shiftCount = shiftCount;
        this.shifts = shifts;
    }

    public GetShiftCountResponse(Long workerId, int shiftCount, YearMonth yearMonth, List<Shift> shifts) {
        this.workerId = workerId;
        this.shiftCount = shiftCount;
        this.yearMonth = yearMonth;
        this.shifts = shifts;
    }
}