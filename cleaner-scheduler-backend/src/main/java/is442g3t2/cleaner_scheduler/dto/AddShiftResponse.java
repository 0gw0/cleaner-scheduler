package is442g3t2.cleaner_scheduler.dto;

import is442g3t2.cleaner_scheduler.models.shift.Shift;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddShiftResponse {
    private boolean success;
    private String message;
    private List<Shift> shifts;

    public AddShiftResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}
