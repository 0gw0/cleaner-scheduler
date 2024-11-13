package is442g3t2.cleaner_scheduler.dto.worker;

import java.util.*;
import java.util.stream.Collectors;

import is442g3t2.cleaner_scheduler.dto.leave.AnnualLeaveDTO;
import is442g3t2.cleaner_scheduler.dto.leave.MedicalLeaveDTO;
import is442g3t2.cleaner_scheduler.dto.shift.ShiftDTO;
import is442g3t2.cleaner_scheduler.models.leave.AnnualLeave;
import is442g3t2.cleaner_scheduler.models.leave.MedicalLeave;
import is442g3t2.cleaner_scheduler.models.shift.Image;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.models.worker.Worker;
import is442g3t2.cleaner_scheduler.services.S3Service;
import jakarta.persistence.OneToMany;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WorkerDTO {

    private Long id;
    private String name;
    private Set<ShiftDTO> shifts;
    private String phoneNumber;
    private String status;
    private Long supervisorId;
    private String bio;
    private Boolean isVerified;
    private List<AnnualLeaveDTO> annualLeaves;
    private String password;
    private List<MedicalLeaveDTO> medicalLeaves;  // Changed from List<MedicalLeave>
    private String homePostalCode;

    public WorkerDTO(Worker worker, S3Service s3Service) {  // Added S3Service parameter
        this.id = worker.getId();
        this.name = worker.getName();
        this.shifts = worker.getShifts().stream()
                .map(shift -> new ShiftDTO(
                        shift,
                        getPresignedUrlsForImages(shift.getArrivalImages(), s3Service),
                        getPresignedUrlsForImages(shift.getCompletionImages(), s3Service)
                ))
                .collect(Collectors.toSet());
        this.phoneNumber = worker.getPhoneNumber();
        this.status = worker.getStatus();
        this.supervisorId = worker.getSupervisor();
        this.bio = worker.getBio();
        this.annualLeaves = worker.getAnnualLeaves().stream()
                .map(AnnualLeaveDTO::new)
                .collect(Collectors.toList());

        // Convert MedicalLeaves to MedicalLeaveDTO with presigned URLs
        this.medicalLeaves = worker.getMedicalLeaves().stream()
                .map(medicalLeave -> {
                    String presignedUrl = null;
                    if (medicalLeave.getMedicalCertificate() != null) {
                        try {
                            presignedUrl = s3Service.getPresignedUrl(
                                    medicalLeave.getMedicalCertificate().getS3Key(),
                                    3600  // URL valid for 1 hour
                            ).toString();
                        } catch (Exception e) {
                        }
                    }
                    return new MedicalLeaveDTO(medicalLeave, presignedUrl);
                })
                .collect(Collectors.toList());

        this.password = worker.getPassword();
        this.isVerified = worker.getIsVerified();
        this.homePostalCode = worker.getHomePostalCode();
    }

    private List<String> getPresignedUrlsForImages(List<? extends Image> images, S3Service s3Service) {
        if (images == null || images.isEmpty()) {
            return new ArrayList<>();
        }

        return images.stream()
                .map(image -> {
                    try {
                        return s3Service.getPresignedUrl(image.getS3Key(), 3600).toString();
                    } catch (Exception e) {
                        System.err.println("Error generating presigned URL for image: " + e.getMessage());
                        return null;
                    }
                })
                .filter(url -> url != null)
                .collect(Collectors.toList());
    }

}
