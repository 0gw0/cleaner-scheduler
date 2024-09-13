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
@Table(name = "admins")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "supervisor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Worker> workers = new ArrayList<>();

    public Admin(String name) {
        this.name = name;
    }

    public List<Long> getWorkers() {
        List<Long> result = new ArrayList<>();
        for (Worker worker : workers) {
            result.add(worker.getId());
        }
        return result;
    }

    public void addWorker(Worker worker) {
        workers.add(worker);
        worker.setSupervisor(this);
    }

    public void removeWorker(Worker worker) {
        workers.remove(worker);
        worker.setSupervisor(null);
    }
}