package is442g3t2.cleaner_scheduler.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

@Embeddable
@NoArgsConstructor
@Getter
@Setter
public class Shift {


    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    public Shift(LocalDate date, LocalTime startTime, LocalTime endTime) {
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    // TODO: defos need updating, just checks if start > end for now
    public boolean isValid() {
        return startTime != null && endTime != null && startTime.isBefore(endTime);
    }

    @Override
    public String toString() {
        return String.format("%s: %s - %s", date, startTime, endTime);
    }
}