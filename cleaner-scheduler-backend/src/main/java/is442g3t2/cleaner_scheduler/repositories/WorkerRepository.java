package is442g3t2.cleaner_scheduler.repositories;

import is442g3t2.cleaner_scheduler.models.Worker;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkerRepository extends JpaRepository<Worker, Long> {

    Optional<Worker> findByEmployeeId(String employeeId);

    List<Worker> findBySupervisorId(Long supervisorId);
}
