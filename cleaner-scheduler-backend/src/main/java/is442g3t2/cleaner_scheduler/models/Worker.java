package is442g3t2.cleaner_scheduler.models;

import is442g3t2.cleaner_scheduler.exceptions.ShiftsOverlapException;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.Period;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "workers")
public class Worker {

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

    //    If we know how many they start with, can possibly change to annualLeavesRemaining
    @Column
    private Integer annualLeavesTaken = 0;

    //    If we know how many they start with, can possibly change to medicalCertificatesRemaining
    @Column
    private Integer medicalCertificatesTaken = 0;


    public Worker(String name, String phoneNumber, String bio) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.bio = bio;
    }

    public Long getSupervisor() {
        return supervisor.getId();
    }

    public int getNumShiftsInMonth(YearMonth yearMonth) {
        int res = 0;
        for (Shift shift : shifts) {
            if (YearMonth.from(shift.getDate()).equals(yearMonth)) {
                res++;
            }
        }

        return res;
    }

    private boolean isNewShiftValid(Shift newShift) {

        for (Shift existingShift : shifts) {
            // Check if they are on the same date first
            if (newShift.getDate().equals(existingShift.getDate())) {
                // Check if new shift overlaps with existing shift
                if (shiftsOverlap(newShift, existingShift)) {
                    return false;
                }
            }
        }
        return true;
    }

    private boolean shiftsOverlap(Shift shift1, Shift shift2) {
//                1. The new shift should end before the existing shift starts, OR
//                2. The existing shift should end before the new shift starts
        return !(shift1.getEndTime().isBefore(shift2.getStartTime()) ||
                shift2.getEndTime().isBefore(shift1.getStartTime()));
    }

    public void addShift(Shift shift) throws ShiftsOverlapException {
        if (isNewShiftValid(shift)) {
            shifts.add(shift);
            shift.setWorker(this);
        } else {
            throw new ShiftsOverlapException("The new shift overlaps with an existing shift. OR ends before it starts");
        }
    }

    public void removeShift(Shift shift) {
        shifts.remove(shift);
    }

    public void takeLeave(LocalDate startDate, LocalDate endDate) {
        Period period = Period.between(startDate, endDate);
        int numOfLeaveDays = period.getDays();
        annualLeavesTaken += numOfLeaveDays;
    }


}