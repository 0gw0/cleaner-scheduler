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

    public Image(String s3Key, String fileName) {
        this.s3Key = s3Key;
        this.fileName = fileName;
        this.uploadTime = LocalDateTime.now();
    }
}