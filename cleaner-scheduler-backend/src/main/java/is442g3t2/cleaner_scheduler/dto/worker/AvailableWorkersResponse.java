package is442g3t2.cleaner_scheduler.dto.worker;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AvailableWorkersResponse {

    private List<WorkerDTO> currentWorkers;
    private List<WorkerDTO> newWorkers;

}
