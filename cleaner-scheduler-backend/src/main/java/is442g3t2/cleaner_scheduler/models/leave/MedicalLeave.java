package is442g3t2.cleaner_scheduler.models.leave;

import com.fasterxml.jackson.annotation.JsonIgnore;
import is442g3t2.cleaner_scheduler.models.worker.Worker;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "medical_leaves")
public class MedicalLeave extends Leave {

    @Embedded
    private MedicalCertificate medicalCertificate;

    public MedicalLeave(Worker worker, LocalDate startDate, LocalDate endDate) {
        super(worker, startDate, endDate);
    }

    public void setMedicalCertificate(MedicalCertificate medicalCertificate) {
        this.medicalCertificate = medicalCertificate;
        isApproved = true;
    }
}
