package is442g3t2.cleaner_scheduler.models.shift;


import lombok.Getter;

import java.time.temporal.ChronoUnit;
import java.util.Objects;

@Getter
public final class Frequency {
    private final int interval;
    private final ChronoUnit unit;

    public Frequency(int interval, ChronoUnit unit) {
        if (interval <= 0) {
            throw new IllegalArgumentException("Interval must be positive");
        }
        this.interval = interval;
        this.unit = unit;
    }

    // Factory methods for common frequencies
    public static Frequency daily() {
        return new Frequency(1, ChronoUnit.DAYS);
    }

    public static Frequency weekly() {
        return new Frequency(1, ChronoUnit.WEEKS);
    }

    public static Frequency monthly() {
        return new Frequency(1, ChronoUnit.MONTHS);
    }

    public static Frequency quarterly() {
        return new Frequency(3, ChronoUnit.MONTHS);
    }

    // Custom frequency
    public static Frequency custom(int interval, ChronoUnit unit) {
        return new Frequency(interval, unit);
    }

}