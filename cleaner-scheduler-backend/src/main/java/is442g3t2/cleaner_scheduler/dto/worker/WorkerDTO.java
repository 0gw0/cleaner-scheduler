package is442g3t2.cleaner_scheduler.dto.worker;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import is442g3t2.cleaner_scheduler.models.leave.AnnualLeave;
import is442g3t2.cleaner_scheduler.models.leave.MedicalLeave;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.models.worker.Worker;
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
    private ArrayList<Shift> shifts;  
    private String phoneNumber;
    private String status;
    private Long supervisorId;  
    private String bio;
    private List<AnnualLeave> annualLeaves;
    private List<MedicalLeave> medicalLeaves;

    
    public WorkerDTO(Worker worker) {
        this.id = worker.getId();
        this.name = worker.getName();
        this.shifts = new ArrayList<>(worker.getShifts());
        this.phoneNumber = worker.getPhoneNumber();
        this.status = worker.getStatus();
        this.supervisorId = worker.getSupervisor(); 
        this.bio = worker.getBio();
        this.annualLeaves = new ArrayList<>(worker.getAnnualLeaves());
        this.medicalLeaves = new ArrayList<>(worker.getMedicalLeaves());
    }
}
