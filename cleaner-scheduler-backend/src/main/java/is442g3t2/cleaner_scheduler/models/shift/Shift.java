package is442g3t2.cleaner_scheduler.models.shift;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import is442g3t2.cleaner_scheduler.exceptions.InvalidShiftException;
import is442g3t2.cleaner_scheduler.models.property.Property;
import is442g3t2.cleaner_scheduler.models.property.PropertyInfo;
import is442g3t2.cleaner_scheduler.models.worker.Worker;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@NoArgsConstructor
@Getter
@Setter
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
)
public class Shift {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany
    @JoinTable(
            name = "shift_workers",
            joinColumns = @JoinColumn(name = "shift_id"),
            inverseJoinColumns = @JoinColumn(name = "worker_id")
    )
    private List<Worker> workers = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "property_id")
    private Property property;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShiftStatus status;

    @Embedded
    private ArrivalImage arrivalImage;


    public Shift(LocalDate date, LocalTime startTime, LocalTime endTime, Property property, ShiftStatus status) throws InvalidShiftException {
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.property = property;
        this.status = status;

        if (!isValid()) {
            throw new InvalidShiftException("Invalid shift: start time must be before end time and neither can be null");
        }
    }

    public Shift(Shift shift) {
    }

    public Shift(LocalDate targetDate, LocalTime targetStartTime, LocalTime targetEndTime) {
        this.date = targetDate;
        this.startTime = targetStartTime;
        this.endTime = targetEndTime;
    }


    public Set<Long> getWorkerIds() {
        return workers.stream()
                .map(Worker::getId)
                .collect(java.util.stream.Collectors.toSet());
    }

    public void addWorker(Worker worker) {
        workers.add(worker);
        worker.getShifts().add(this);
    }

    public void removeWorker(Worker worker) {
        workers.remove(worker);
        worker.getShifts().remove(this);
    }


    public PropertyInfo getProperty() {
        if (property != null) {
            return new PropertyInfo(property.getId(), property.getClient(), property.getAddress(), property.getPostalCode());
        } else {
            return null; // Or you can throw an exception, or return a default value, depending on your use case.
        }
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