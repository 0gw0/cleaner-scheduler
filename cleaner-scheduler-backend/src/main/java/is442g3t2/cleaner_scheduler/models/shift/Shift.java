package is442g3t2.cleaner_scheduler.models.shift;

import is442g3t2.cleaner_scheduler.exceptions.InvalidShiftException;
import is442g3t2.cleaner_scheduler.models.Property;
import is442g3t2.cleaner_scheduler.models.PropertyInfo;
import is442g3t2.cleaner_scheduler.models.Worker;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@NoArgsConstructor
@Getter
@Setter
public class Shift {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "worker_id")
    private Worker worker;

    @ManyToOne
    @JoinColumn(name = "property_id")
    private Property property;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    public Shift(LocalDate date, LocalTime startTime, LocalTime endTime, Property property) throws InvalidShiftException {
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.property = property;

        if (!isValid()) {
            throw new InvalidShiftException("Invalid shift: start time must be before end time and neither can be null");
        }
    }

    public Long getWorker() {
        return worker.getId();
    }


    public PropertyInfo getProperty() {
        return new PropertyInfo(property.getId(), property.getClient());
    }

    // just checks if start > end
    private boolean isValid() {
        return startTime != null && endTime != null && startTime.isBefore(endTime);
    }


    @Override
    public String toString() {
        return String.format("%s: %s - %s", date, startTime, endTime);
    }

}