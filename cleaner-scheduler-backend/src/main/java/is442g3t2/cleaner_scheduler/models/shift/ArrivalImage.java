package is442g3t2.cleaner_scheduler.models.shift;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
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
@AttributeOverrides({
        @AttributeOverride(name = "s3Key", column = @Column(name = "arrival_s3_key")),
        @AttributeOverride(name = "uploadTime", column = @Column(name = "arrival_upload_time")),
        @AttributeOverride(name = "fileName", column = @Column(name = "arrival_file_name")),
        @AttributeOverride(name = "workerId", column = @Column(name = "arrival_worker_id"))
})
public class ArrivalImage extends Image {
    public ArrivalImage(String s3Key, String fileName, Long workerId) {
        super(s3Key, fileName, workerId);
    }

    public ArrivalImage(String s3Key, LocalDateTime uploadTime, String fileName, Long workerId) {
        super(s3Key, uploadTime, fileName, workerId);
    }
}