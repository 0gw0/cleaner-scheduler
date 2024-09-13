package is442g3t2.cleaner_scheduler.models;

import is442g3t2.cleaner_scheduler.exceptions.ShiftsOverlapException;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "workers")
public class Worker {

    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "worker", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Shift> shifts = new ArrayList<>();

    @Column(nullable = false)
    private String phoneNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private Admin supervisor;

    @Column(columnDefinition = "TEXT")
    private String bio;

    public Worker(String name, String phoneNumber, String bio) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.bio = bio;
    }

    public Long getSupervisor() {
        return supervisor.getId();
    }

    private boolean isNewShiftValid(Shift newShift) {
        if (!newShift.isValid()) {
            return false;
        }

        for (Shift existingShift : shifts) {
            // Check if they are on the same date first
            if (newShift.getDate().equals(existingShift.getDate())) {
                // Check if new shift overlaps with existing shift
//                1. The new shift should end before the existing shift starts, OR
//                2. The existing shift should end before the new shift starts
                if (!(newShift.getEndTime().isBefore(existingShift.getStartTime()) ||
                        existingShift.getEndTime().isBefore(newShift.getStartTime()))) {
                    return false;
                }
            }
        }
        return true;
    }

    public void addShift(Shift shift) throws ShiftsOverlapException {
        if (isNewShiftValid(shift)) {
            shifts.add(shift);
            shift.setWorker(this);
        } else {
            throw new ShiftsOverlapException("The new shift overlaps with an existing shift.");
        }
    }

    public void removeShift(Shift shift) {
        shifts.remove(shift);
    }
}