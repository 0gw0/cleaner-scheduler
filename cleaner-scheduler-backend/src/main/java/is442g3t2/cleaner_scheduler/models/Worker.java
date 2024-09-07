package is442g3t2.cleaner_scheduler.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "workers")
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String employeeId;

    @ElementCollection
    @CollectionTable(name = "worker_shifts", joinColumns = @JoinColumn(name = "worker_id"))
    private List<Shift> workingHours = new ArrayList<>();

    @Column(nullable = false)
    private String phoneNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private Admin supervisor;

    @Column(columnDefinition = "TEXT")
    private String bio;

    public Worker(String name, String employeeId, String phoneNumber, String bio) {
        this.name = name;
        this.employeeId = employeeId;
        this.phoneNumber = phoneNumber;
        this.bio = bio;
    }

    public void addShift(Shift shift) {
        workingHours.add(shift);
    }

    public void removeShift(Shift shift) {
        workingHours.remove(shift);
    }
}