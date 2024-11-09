package is442g3t2.cleaner_scheduler.dto.leave;

import is442g3t2.cleaner_scheduler.models.leave.MedicalLeave;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class MedicalLeaveDTO {
    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private MedicalCertificateDTO medicalCertificate;

    public MedicalLeaveDTO(MedicalLeave medicalLeave, String presignedUrl) {
        this.id = medicalLeave.getId();
        this.startDate = medicalLeave.getStartDate();
        this.endDate = medicalLeave.getEndDate();
        if (medicalLeave.getMedicalCertificate() != null) {
            this.medicalCertificate = new MedicalCertificateDTO(
                    medicalLeave.getMedicalCertificate(),
                    presignedUrl
            );
        }
    }
}
