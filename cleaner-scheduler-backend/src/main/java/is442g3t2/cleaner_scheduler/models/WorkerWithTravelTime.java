package is442g3t2.cleaner_scheduler.models;

import com.google.maps.model.LatLng;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import lombok.Getter;

@Getter
public class WorkerWithTravelTime implements Comparable<WorkerWithTravelTime> {
    private Worker worker;
    private long travelTimeToTarget;
    private Shift shift;
    private LatLng originLocation;

    public WorkerWithTravelTime(Worker worker, long travelTimeToTarget, Shift shift, LatLng originLocation) {
        this.worker = worker;
        this.travelTimeToTarget = travelTimeToTarget;
        this.shift = shift;
        this.originLocation = originLocation;
    }

    @Override
    public int compareTo(WorkerWithTravelTime other) {
        return Long.compare(this.travelTimeToTarget, other.travelTimeToTarget);
    }
}

