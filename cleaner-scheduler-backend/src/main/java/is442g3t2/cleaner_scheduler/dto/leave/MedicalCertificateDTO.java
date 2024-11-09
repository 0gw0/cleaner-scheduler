package is442g3t2.cleaner_scheduler.dto.leave;

import is442g3t2.cleaner_scheduler.models.leave.MedicalCertificate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class MedicalCertificateDTO {
    private String s3Key;
    private LocalDateTime uploadTime;
    private String fileName;
    private String presignedUrl;  // Added field for presigned URL

    public MedicalCertificateDTO(MedicalCertificate mc, String presignedUrl) {
        this.s3Key = mc.getS3Key();
        this.uploadTime = mc.getUploadTime();
        this.fileName = mc.getFileName();
        this.presignedUrl = presignedUrl;
    }
}