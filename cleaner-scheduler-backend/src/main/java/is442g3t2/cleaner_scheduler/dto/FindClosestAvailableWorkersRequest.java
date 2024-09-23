package is442g3t2.cleaner_scheduler.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class FindClosestAvailableWorkersRequest {

    String postalCode;
    LocalTime startTime;
    LocalTime endTime;
    LocalDate date;
}
