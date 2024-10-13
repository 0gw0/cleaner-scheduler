package is442g3t2.cleaner_scheduler.dto.worker;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor

public class WorkerDTO {
    private Long id;
    private String name;
    private String phoneNumber;
    private String bio;
    private Long supervisorId;

    public WorkerDTO(Long id, String name, String phoneNumber, String bio, Long supervisorId) {
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.bio = bio;
        this.supervisorId = supervisorId;
    }
}