package is442g3t2.cleaner_scheduler.models.shift;

import lombok.Getter;

@Getter
public enum ShiftStatus {
    UPCOMING("Upcoming"),
    IN_PROGRESS("In Progress"),
    COMPLETED("Completed");

    private final String displayName;

    ShiftStatus(String displayName) {
        this.displayName = displayName;
    }

}