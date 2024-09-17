package is442g3t2.cleaner_scheduler.models.leave;

import com.fasterxml.jackson.annotation.JsonIgnore;
import is442g3t2.cleaner_scheduler.models.Worker;
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
public class AnnualLeave implements Leave{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker worker;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    public AnnualLeave(Worker worker, LocalDate startDate, LocalDate endDate) {
        this.worker = worker;
        this.startDate = startDate;
        this.endDate = endDate;

    }
}
