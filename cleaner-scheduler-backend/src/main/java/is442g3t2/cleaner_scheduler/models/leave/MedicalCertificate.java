package is442g3t2.cleaner_scheduler.models.leave;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class MedicalCertificate {

    private String s3Key;
    private LocalDateTime uploadTime;
    private String fileName;

    public MedicalCertificate(String s3Key, String fileName) {
        this.s3Key = s3Key;
        this.fileName = fileName;
        this.uploadTime = LocalDateTime.now();
    }
}
