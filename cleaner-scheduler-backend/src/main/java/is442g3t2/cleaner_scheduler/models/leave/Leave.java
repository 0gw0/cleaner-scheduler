package is442g3t2.cleaner_scheduler.models.leave;

import is442g3t2.cleaner_scheduler.models.worker.Worker;

import java.time.LocalDate;

public interface Leave {

    public Worker getWorker();
    public LocalDate getStartDate();
    public LocalDate getEndDate();

}



