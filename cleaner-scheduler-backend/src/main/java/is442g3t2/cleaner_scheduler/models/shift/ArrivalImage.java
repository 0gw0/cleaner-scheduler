package is442g3t2.cleaner_scheduler.models.shift;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Embeddable
@NoArgsConstructor
@Getter
@Setter
public class ArrivalImage extends Image {

    public ArrivalImage(String s3Key, String fileName) {
        super(s3Key, fileName);
    }

    public ArrivalImage(String s, LocalDateTime now, String image) {
        super(s, now, image);
    }
}