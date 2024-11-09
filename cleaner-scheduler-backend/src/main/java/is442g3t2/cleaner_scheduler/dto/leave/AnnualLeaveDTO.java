package is442g3t2.cleaner_scheduler.dto.leave;

import is442g3t2.cleaner_scheduler.models.leave.AnnualLeave;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class AnnualLeaveDTO {
    private Long id;
    private Long workerId;  // Instead of whole worker object
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private boolean approved;

    public AnnualLeaveDTO(AnnualLeave annualLeave) {
        this.id = annualLeave.getId();
        this.workerId = annualLeave.getWorker().getId();
        this.startDate = annualLeave.getStartDate();
        this.endDate = annualLeave.getEndDate();
        this.status = annualLeave.getStatus();
        this.approved = annualLeave.isApproved();
    }
}