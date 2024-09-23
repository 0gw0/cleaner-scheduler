package is442g3t2.cleaner_scheduler.dto;

import com.google.maps.model.LatLng;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FindClosestAvailableWorkersResponse {

    private Long id;
    private String name;
    private long travelTimeToTarget;
    private Shift relevantShift;
    private LatLng originLocation;


}
