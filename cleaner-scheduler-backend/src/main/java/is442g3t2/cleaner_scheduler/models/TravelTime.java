package is442g3t2.cleaner_scheduler.models;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TravelTime {
    public final long totalTravelTime;
    public final long travelTimeWithoutTraffic;
    public final long travelTimeInTraffic;

    public TravelTime(long totalTravelTime, long travelTimeWithoutTraffic, long travelTimeInTraffic) {
        this.totalTravelTime = totalTravelTime;
        this.travelTimeWithoutTraffic = travelTimeWithoutTraffic;
        this.travelTimeInTraffic = travelTimeInTraffic;
    }
}
