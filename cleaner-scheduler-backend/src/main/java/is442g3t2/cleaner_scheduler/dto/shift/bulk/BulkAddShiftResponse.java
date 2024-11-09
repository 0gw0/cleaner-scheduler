package is442g3t2.cleaner_scheduler.dto.shift.bulk;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class BulkAddShiftResponse {
    private boolean success;
    private String message;
    private Map<Long, String> failedWorkers;

    public BulkAddShiftResponse(boolean success, String message, Map<Long, String> failedWorkers) {
        this.success = success;
        this.message = message;
        this.failedWorkers = failedWorkers;
    }

}
