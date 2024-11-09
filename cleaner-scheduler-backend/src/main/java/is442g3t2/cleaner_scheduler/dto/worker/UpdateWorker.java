package is442g3t2.cleaner_scheduler.dto.worker;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWorker {
    private String name;
    private String phoneNumber;
    private String bio;
    private String homePostalCode;
    private String status;
}