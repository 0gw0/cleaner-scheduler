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
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany
    @JoinTable(name = "shift_workers", joinColumns = @JoinColumn(name = "shift_id"), inverseJoinColumns = @JoinColumn(name = "worker_id"))
    private List<Worker> workers = new ArrayList<>();

    @Column(nullable = true)
    private Set<Long> presentWorkers;

    @Column(nullable = true)
    private Set<Long> completedWorkers;

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

    @Embedded
    private CompletionImage completionImage;

    @Column(nullable = false)
    private LocalDate originalDate;

    @Column(nullable = false)
    private LocalTime originalStartTime;

    @Column(nullable = false)
    private LocalTime originalEndTime;

    @Column(nullable = false)
    private boolean isRescheduled = false;


    public Shift(LocalDate date, LocalTime startTime, LocalTime endTime, Property property, ShiftStatus status)
            throws InvalidShiftException {
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.property = property;
        this.status = status;
        this.originalDate = date;
        this.originalStartTime = startTime;
        this.originalEndTime = endTime;

        if (!isValid()) {
            throw new InvalidShiftException(
                    "Invalid shift: start time must be before end time and neither can be null");
        }
    }

    public Shift(Shift shift) {
    }

    public Shift(LocalDate targetDate, LocalTime targetStartTime, LocalTime targetEndTime) {
        this.date = targetDate;
        this.startTime = targetStartTime;
        this.endTime = targetEndTime;
    }

    public void reschedule(LocalDate newDate, LocalTime newStartTime, LocalTime newEndTime)
            throws InvalidShiftException {
        // Create temporary shift to validate new times
        Shift tempShift = new Shift(newDate, newStartTime, newEndTime, this.property, this.status);

        this.date = newDate;
        this.startTime = newStartTime;
        this.endTime = newEndTime;
        this.isRescheduled = true;
    }

    public boolean isRescheduled() {
        return isRescheduled ||
                !date.equals(originalDate) ||
                !startTime.equals(originalStartTime) ||
                !endTime.equals(originalEndTime);
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
            return new PropertyInfo(property.getId(), property.getClient(), property.getAddress(),
                    property.getPostalCode());
        } else {
            return null; // Or you can throw an exception, or return a default value, depending on your
                         // use case.
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

    public String isValidShiftTime(LocalTime startTime, LocalTime endTime) {
        // Define allowed time ranges
        LocalTime workStart = LocalTime.of(8, 0);
        LocalTime workEnd = LocalTime.of(22, 0);
        LocalTime lunchStart = LocalTime.of(12, 0);
        LocalTime lunchEnd = LocalTime.of(13, 0);
        LocalTime dinnerStart = LocalTime.of(17, 0);
        LocalTime dinnerEnd = LocalTime.of(18, 0);

        // Check if start time is before 8am or end time is after 10pm
        if (startTime.isBefore(workStart) || endTime.isAfter(workEnd)) {
            return "Outside of working hours (8am to 10pm)";
        }

        if (startTime.isBefore(lunchStart) && endTime.isAfter(lunchEnd)) {
            return "Worker's lunch hours are 12pm to 1pm";
        }

        // Check if shift overlaps with lunch hours (12pm-1pm)
        if ((startTime.isBefore(lunchEnd) && startTime.isAfter(lunchStart.minusMinutes(1))) ||
                (endTime.isAfter(lunchStart) && endTime.isBefore(lunchEnd.plusMinutes(1)))) {
            return "Worker's lunch hours are 12pm to 1pm";
        }

        if (startTime.isBefore(dinnerStart) && endTime.isAfter(dinnerEnd)) {
            return "Worker's dinner hours are 5pm to 6pm";
        }

        // Check if shift overlaps with dinner hours (5pm-6pm)
        if ((startTime.isBefore(dinnerEnd) && startTime.isAfter(dinnerStart.minusMinutes(1))) ||
                (endTime.isAfter(dinnerStart) && endTime.isBefore(dinnerEnd.plusMinutes(1)))) {
            return "Worker's dinner hours are 5pm to 6pm";
        }

        // Check if shift falls within allowed ranges: 8am-12pm, 1pm-5pm, or 6pm-10pm
        LocalTime morningEnd = LocalTime.of(12, 0).plusMinutes(1);
        LocalTime afternoonStart = LocalTime.of(13, 0);
        LocalTime afternoonEnd = LocalTime.of(17, 0).plusMinutes(1);
        LocalTime eveningStart = LocalTime.of(18, 0);

        boolean isWithinAllowedRanges = (startTime.equals(workStart)
                || startTime.isAfter(workStart) && endTime.isBefore(morningEnd)) ||
                (startTime.equals(afternoonStart)
                        || startTime.isAfter(afternoonStart) && endTime.isBefore(afternoonEnd))
                ||
                (startTime.equals(eveningStart) || startTime.isAfter(eveningStart) && endTime.isBefore(workEnd));

        return isWithinAllowedRanges ? "" : "Shift must be within allowed timings: 8am-12pm, 1pm-5pm, or 6pm-10pm";
    }

}