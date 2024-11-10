package is442g3t2.cleaner_scheduler.services;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.models.shift.ShiftStatus;
import is442g3t2.cleaner_scheduler.repositories.ShiftRepository;


import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ShiftStatusCheckerService {

    @Autowired
    private ShiftRepository shiftRepository;

    @Scheduled(fixedRate = 60000) 
    public void checkShiftStatuses() {
        log.info("Running shift status check...");
        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        List<Shift> shiftsToCheck = shiftRepository.findByShiftStatusAndStartTimeBefore(
            currentDate,
            currentTime.minusMinutes(15)
        );

        for (Shift shift : shiftsToCheck) {
            updateShiftStatus(shift);
        }
    }

    private void updateShiftStatus(Shift shift) {
        try {
            if (shift.getArrivalImage() == null) {
                shift.setStatus(ShiftStatus.ABSENT);
                log.info("Shift {} marked as CANCELLED due to missing arrival image", shift.getId());
            } 
            shiftRepository.save(shift);
        } catch (Exception e) {
            log.info("Error updating shift status for shift {}: {}", shift.getId(), e.getMessage());
        }
    }
}
