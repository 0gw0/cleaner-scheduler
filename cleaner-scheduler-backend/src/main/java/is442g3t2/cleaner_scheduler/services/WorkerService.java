package is442g3t2.cleaner_scheduler.services;

import is442g3t2.cleaner_scheduler.models.worker.Worker;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.repositories.WorkerRepository;
import org.springframework.stereotype.Service;
import is442g3t2.cleaner_scheduler.dto.worker.UpdateWorker;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.ArrayList;
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
                .collect(Collectors.toList());
    }

    public List<Shift> getAllShiftsByWorkerId(Long workerId) {
        Worker worker = workerRepository.getReferenceById(workerId);
        return new ArrayList<>(worker.getShifts());
    }

    public List<Shift> getAllShiftsByWorkerIdByDate(Worker worker, LocalDate startDate, LocalDate endDate) {
        Long workerId = worker.getId();
        if (!workerRepository.existsById(workerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found");
        }

        // Worker worker = workerRepository.getReferenceById(workerId);
        return worker.getShifts().stream()
                .filter(shift -> !shift.getDate().isBefore(startDate) && !shift.getDate().isAfter(endDate))
                .collect(Collectors.toList());
    }

    public void removeAllShiftsByWorkerIdByDate(Worker worker, LocalDate startDate, LocalDate endDate) {

        Long workerId = worker.getId();
        if (!workerRepository.existsById(workerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found");
        }

        List<Shift> shiftsToRemove = getAllShiftsByWorkerIdByDate(worker, startDate, endDate);
        for (Shift shift : shiftsToRemove) {
            worker.removeShift(shift);
        }
    }

    public Worker updateWorker(Long id, UpdateWorker UpdateWorker) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + id));

        if (UpdateWorker.getName() != null) {
            worker.setName(UpdateWorker.getName());
        }
        if (UpdateWorker.getPhoneNumber() != null) {
            worker.setPhoneNumber(UpdateWorker.getPhoneNumber());
        }
        if (UpdateWorker.getBio() != null) {
            worker.setBio(UpdateWorker.getBio());
        }
        // if (UpdateWorker.getHomePostalCode() != null) {
        //     worker.setHomePostalCode(UpdateWorker.getHomePostalCode());
        // }
        if (UpdateWorker.getStatus() != null) {
            worker.setStatus(UpdateWorker.getStatus());
        }

        return workerRepository.save(worker);
    }
}