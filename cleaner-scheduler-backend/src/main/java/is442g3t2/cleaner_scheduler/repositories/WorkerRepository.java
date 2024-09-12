package is442g3t2.cleaner_scheduler.repositories;

import is442g3t2.cleaner_scheduler.models.Worker;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface WorkerRepository extends JpaRepository<Worker, Long> {


    List<Worker> findBySupervisorId(Long supervisorId);
}
