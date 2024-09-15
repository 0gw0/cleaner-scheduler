package is442g3t2.cleaner_scheduler.models;

import java.time.LocalDate;

public interface Leave {

    public Worker getWorker();
    public LocalDate getStartDate();
    public LocalDate getEndDate();

}
