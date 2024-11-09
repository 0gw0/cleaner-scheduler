package is442g3t2.cleaner_scheduler.models.leave;

import is442g3t2.cleaner_scheduler.models.worker.Worker;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@MappedSuperclass
public abstract class Leave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    protected Worker worker;

    @Column(nullable = false)
    protected LocalDate startDate;

    @Column(nullable = false)
    protected LocalDate endDate;

    @Column(nullable = false)
    protected boolean isApproved = false;  // default to false

    public Leave(Worker worker, LocalDate startDate, LocalDate endDate) {
        this.worker = worker;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}
