package is442g3t2.cleaner_scheduler.dto.shift;

import is442g3t2.cleaner_scheduler.models.shift.Shift;

import java.util.List;
import java.util.stream.Collectors;

public class GetAllShiftsResponse {
    private final List<Shift> shifts;
    private final String status;
    private final Integer year;
    private final Integer month;

    public GetAllShiftsResponse(List<Shift> shifts, String status, Integer year, Integer month) {
        this.shifts = shifts.stream().map(Shift::new).collect(Collectors.toList());
        this.status = status;
        this.year = year;
        this.month = month;
    }

}
