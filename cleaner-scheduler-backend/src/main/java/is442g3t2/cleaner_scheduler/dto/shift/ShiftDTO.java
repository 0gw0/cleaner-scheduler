package is442g3t2.cleaner_scheduler.dto.shift;

import is442g3t2.cleaner_scheduler.models.property.PropertyInfo;
import is442g3t2.cleaner_scheduler.models.shift.ArrivalImage;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
public class ShiftDTO {
    private Long id;
    private Set<Long> workers;  // Just the IDs
    private PropertyInfo property;  // Already a DTO-like class
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private ArrivalImageDTO arrivalImage;
    private Set<Long> workerIds;  // Matching your current structure

    public ShiftDTO(Shift shift, String presignedUrl) {
        this.id = shift.getId();
        this.workers = shift.getWorkerIds();  // Already returns Set<Long>
        this.property = shift.getProperty();  // Already returns PropertyInfo
        this.date = shift.getDate();
        this.startTime = shift.getStartTime();
        this.endTime = shift.getEndTime();
        this.status = shift.getStatus().toString();
        this.arrivalImage = shift.getArrivalImage() != null
                ? new ArrivalImageDTO(shift.getArrivalImage(), presignedUrl)
                : null;
        this.workerIds = shift.getWorkerIds();  // Duplicate of workers, matching current structure
    }
}

@Getter
@Setter
@NoArgsConstructor
class ArrivalImageDTO {
    private String s3Key;
    private LocalDateTime uploadTime;
    private String fileName;
    private String presignedUrl;

    public ArrivalImageDTO(ArrivalImage image, String presignedUrl) {
        if (image != null) {
            this.s3Key = image.getS3Key();
            this.uploadTime = image.getUploadTime();
            this.fileName = image.getFileName();
            this.presignedUrl = presignedUrl;
        }
    }
}