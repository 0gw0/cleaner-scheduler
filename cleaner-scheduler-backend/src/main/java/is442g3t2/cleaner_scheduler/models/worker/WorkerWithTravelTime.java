package is442g3t2.cleaner_scheduler.models.worker;

import com.google.maps.model.LatLng;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.models.shift.TravelTime;
import lombok.Getter;

@Getter
public class WorkerWithTravelTime implements Comparable<WorkerWithTravelTime> {
    private final Worker worker;
    private final TravelTime travelTimeResult;
    private final Shift shift;
    private final LatLng originLocation;

    public WorkerWithTravelTime(Worker worker, TravelTime travelTimeResult, Shift shift, LatLng originLocation) {
        this.worker = worker;
        this.travelTimeResult = travelTimeResult;
        this.shift = shift;
        this.originLocation = originLocation;
    }

    @Override
    public int compareTo(WorkerWithTravelTime other) {
        return Long.compare(this.travelTimeResult.getTotalTravelTime(), other.travelTimeResult.getTotalTravelTime());
    }

    // Convenience methods to access travel time information
    public long getTotalTravelTimeToTarget() {
        return travelTimeResult.getTotalTravelTime();
    }

    public long getTravelTimeInTraffic() {
        return travelTimeResult.getTravelTimeInTraffic();
    }

    public long getTravelTimeWithoutTraffic() {
        return travelTimeResult.getTravelTimeWithoutTraffic();
    }
}
