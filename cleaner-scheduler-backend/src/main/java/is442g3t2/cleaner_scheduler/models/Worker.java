package is442g3t2.cleaner_scheduler.models;

import is442g3t2.cleaner_scheduler.exceptions.ShiftsOverlapException;
import is442g3t2.cleaner_scheduler.models.leave.AnnualLeave;
import is442g3t2.cleaner_scheduler.models.leave.Leave;
import is442g3t2.cleaner_scheduler.models.leave.MedicalLeave;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

    @OneToMany(mappedBy = "worker", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnnualLeave> annualLeaves = new ArrayList<>();

    @OneToMany(mappedBy = "worker", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedicalLeave> medicalLeaves = new ArrayList<>();

    public Worker(String name, String phoneNumber, String bio) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.bio = bio;
    }

    public Long getSupervisor() {
        return supervisor.getId();
    }

    public int getNumShiftsInMonth(YearMonth yearMonth) {
        return (int) shifts.stream()
                .filter(shift -> YearMonth.from(shift.getDate()).equals(yearMonth))
                .count();
    }

    private boolean isNewShiftValid(Shift newShift) {
        return shifts.stream()
                .noneMatch(existingShift -> existingShift.getDate().equals(newShift.getDate()) && shiftsOverlap(newShift, existingShift));
    }

    private boolean shiftsOverlap(Shift shift1, Shift shift2) {
        return !(shift1.getEndTime().isBefore(shift2.getStartTime()) ||
                shift2.getEndTime().isBefore(shift1.getStartTime()));
    }

    public void addShift(Shift shift) throws ShiftsOverlapException {
        if (isNewShiftValid(shift)) {
            shifts.add(shift);
            shift.setWorker(this);
        } else {
            throw new ShiftsOverlapException("The new shift overlaps with an existing shift or ends before it starts");
        }
    }

    public void removeShift(Shift shift) {
        shifts.remove(shift);
    }

    public void takeLeave(LocalDate startDate, LocalDate endDate) {
        AnnualLeave leave = new AnnualLeave(this, startDate, endDate);
        annualLeaves.add(leave);
    }

    private <T extends Leave> List<T> getLeavesByYear(List<T> leaves, int year) {
        return leaves.stream()
                .filter(leave -> isLeaveInYear(leave, year))
                .collect(Collectors.toList());
    }

    private boolean isLeaveInYear(Leave leave, int year) {
        return leave.getStartDate().getYear() == year || leave.getEndDate().getYear() == year;
    }

    private long calculateTotalLeaveDays(List<? extends Leave> leaves, int year) {
        return leaves.stream()
                .mapToLong(leave -> calculateLeaveDuration(leave, year))
                .sum();
    }

    private long calculateLeaveDuration(Leave leave, int year) {
        LocalDate start = getYearAdjustedDate(leave.getStartDate(), year, true);
        LocalDate end = getYearAdjustedDate(leave.getEndDate(), year, false);
        return ChronoUnit.DAYS.between(start, end) + 1; // +1 to include both start and end dates
    }

    private LocalDate getYearAdjustedDate(LocalDate date, int year, boolean isStartDate) {
        if (date.getYear() == year) {
            return date;
        }
        return isStartDate ? LocalDate.of(year, 1, 1) : LocalDate.of(year, 12, 31);
    }

    public List<AnnualLeave> getAnnualLeavesByYear(int year) {
        return getLeavesByYear(annualLeaves, year);
    }

    public Long getTotalAnnualLeavesTakenByYear(int year) {
        return calculateTotalLeaveDays(getAnnualLeavesByYear(year), year);
    }


    public List<MedicalLeave> getMedicalLeavesByYear(int year) {
        return getLeavesByYear(medicalLeaves, year);
    }

    public Long getTotalMedicalLeavesTakenByYear(int year) {
        return calculateTotalLeaveDays(getMedicalLeavesByYear(year), year);
    }

    public void takeMedicalLeave(LocalDate startDate, LocalDate endDate) {
        MedicalLeave leave = new MedicalLeave(this, startDate, endDate);
        medicalLeaves.add(leave);
    }
}