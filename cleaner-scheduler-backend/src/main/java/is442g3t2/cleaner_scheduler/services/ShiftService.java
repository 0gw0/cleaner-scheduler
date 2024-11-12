
package is442g3t2.cleaner_scheduler.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import is442g3t2.cleaner_scheduler.models.worker.Worker;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.models.shift.ShiftStatus;
import is442g3t2.cleaner_scheduler.repositories.WorkerRepository;
import is442g3t2.cleaner_scheduler.repositories.ShiftRepository;

@Service
public class ShiftService {
    private final ShiftRepository shiftRepository;

    private final WorkerRepository workerRepository;

    public ShiftService(ShiftRepository shiftRepository, WorkerRepository workerRepository) {
        this.shiftRepository = shiftRepository;
        this.workerRepository = workerRepository;
    }

    @Transactional
    public Shift updateShiftDetails(Long shiftId, List<Long> workerIds, LocalDate newDate, LocalTime newStartTime, LocalTime newEndTime) {
        return shiftRepository.findById(shiftId).map(shift -> {
            List<Worker> workers = workerRepository.findAllById(workerIds);
            shift.setWorkers(new ArrayList<>(workers));
    
            shift.setDate(newDate);
            shift.setStartTime(newStartTime);
            shift.setEndTime(newEndTime);
            shift.setRescheduled(true);
    
            return shiftRepository.save(shift);
        }).orElseThrow(() -> new IllegalArgumentException("Shift not found with ID: " + shiftId));
    }

    public List<Shift> getUpcomingShifts() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime fifteenMinutesFromNow = LocalDateTime.now().plusMinutes(15);

        List<Shift> allShifts = shiftRepository.findAll(); 

        return allShifts.stream()
                .filter(shift -> {
                    LocalDateTime shiftStart = LocalDateTime.of(shift.getDate(), shift.getStartTime());
                    return shiftStart.isAfter(now) && shiftStart.isBefore(fifteenMinutesFromNow);
                })
                .collect(Collectors.toList());
    }

    public Shift updateShiftStatus(Long shiftId, ShiftStatus status) {
        Shift shift = shiftRepository.findById(shiftId)
            .orElseThrow(() -> new IllegalArgumentException("Shift not found with id: " + shiftId));

            shift.setStatus(status);
        return shiftRepository.save(shift);
    }
}
