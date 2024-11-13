package is442g3t2.cleaner_scheduler.dto.shift;

import is442g3t2.cleaner_scheduler.models.property.PropertyInfo;
import is442g3t2.cleaner_scheduler.models.shift.ArrivalImage;
import is442g3t2.cleaner_scheduler.models.shift.Image;
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
    private ImageDTO arrivalImage;
    private ImageDTO completionImage;
    private Set<Long> workerIds;  // Matching your current structure
    private LocalDate originalDate;
    private LocalTime originalStartTime;
    private LocalTime originalEndTime;
    private boolean isRescheduled;
    private Set<Long> presentWorkers;
    private Set<Long> completedWorkers;


    public ShiftDTO(Shift shift, String arrivalPresignedUrl, String completionPresignedUrl) {
        this.id = shift.getId();
        this.workers = shift.getWorkerIds();  // Already returns Set<Long>
        this.property = shift.getProperty();  // Already returns PropertyInfo
        this.date = shift.getDate();
        this.startTime = shift.getStartTime();
        this.endTime = shift.getEndTime();
        this.status = shift.getStatus().toString();
        this.arrivalImage = shift.getArrivalImage() != null
                ? new ImageDTO(shift.getArrivalImage(), arrivalPresignedUrl)
                : null;
        this.workerIds = shift.getWorkerIds();  // Duplicate of workers, matching current structure
        this.isRescheduled = shift.isRescheduled();
        this.originalDate = shift.getOriginalDate();
        this.originalStartTime = shift.getOriginalStartTime();
        this.originalEndTime = shift.getOriginalEndTime();
        this.presentWorkers = shift.getPresentWorkers();
        this.completedWorkers = shift.getCompletedWorkers();
        this.completionImage = shift.getCompletionImage() != null
                ? new ImageDTO(shift.getCompletionImage(), completionPresignedUrl)
                : null;
    }
}

@Getter
@Setter
@NoArgsConstructor
class ImageDTO {
    private String s3Key;
    private LocalDateTime uploadTime;
    private String fileName;
    private String presignedUrl;
    private Long workerId;

    public ImageDTO(Image image, String presignedUrl) {
        System.out.println("image is null");
        if (image != null) {
            this.s3Key = image.getS3Key();
            this.uploadTime = image.getUploadTime();
            this.fileName = image.getFileName();
            this.presignedUrl = presignedUrl;
            this.workerId = image.getWorkerId();
        }
    }
}