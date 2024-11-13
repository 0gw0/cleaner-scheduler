package is442g3t2.cleaner_scheduler.models.shift;

import jakarta.persistence.Embeddable;
import jakarta.persistence.MappedSuperclass;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@MappedSuperclass
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public abstract class Image {
    private String s3Key;
    private LocalDateTime uploadTime;
    private String fileName;
    private Long workerId;

    public Image(String s3Key, String fileName, Long workerId) {
        this.s3Key = s3Key;
        this.fileName = fileName;
        this.workerId = workerId;
        this.uploadTime = LocalDateTime.now();
    }
}