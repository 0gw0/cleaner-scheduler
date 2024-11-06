package is442g3t2.cleaner_scheduler.services;

import is442g3t2.cleaner_scheduler.models.worker.Worker;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.repositories.WorkerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkerService {
    private final WorkerRepository workerRepository;

    public WorkerService(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }

    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }

    public List<Worker> getWorkersBySupervisorId(Long supervisorId) {
        return workerRepository.findBySupervisor_Id(supervisorId);
    }

    public List<Shift> getAllShiftsBySupervisorId(Long supervisorId) {
        List<Worker> workers = getWorkersBySupervisorId(supervisorId);
        return workers.stream()
                .flatMap(worker -> worker.getShifts().stream())
                .distinct()
                .collect(Collectors.toList());
    }
}