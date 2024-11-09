package is442g3t2.cleaner_scheduler.models.leave;

import com.fasterxml.jackson.annotation.JsonIgnore;
import is442g3t2.cleaner_scheduler.models.worker.Worker;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "annual_leaves")
public class AnnualLeave extends Leave {

    @Column(nullable=false)
    private String status;

    {
        this.status = "PENDING";
    }

    public AnnualLeave(Worker worker, LocalDate startDate, LocalDate endDate) {
        super(worker, startDate, endDate);
    }
}
