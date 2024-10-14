package is442g3t2.cleaner_scheduler.dto.property;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostPropertyRequest {
    private String address;
    private String postalCode;
    private Long clientId;
}