package is442g3t2.cleaner_scheduler.models.property;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PropertyInfo {
    private Long propertyId;
    private Long clientId;
    private String address;
    private String postalCode;
}