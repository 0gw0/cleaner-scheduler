package is442g3t2.cleaner_scheduler.dto.leave;
import jakarta.validation.constraints.NotNull;
import is442g3t2.cleaner_scheduler.models.leave.LeaveStatus;
public class UpdateAnnualLeaveRequest {
    @NotNull
    private LeaveStatus status;
    public LeaveStatus getStatus() {
        return status;
    }
    public void setStatus(LeaveStatus status) {
        this.status = status;
    }
    
}