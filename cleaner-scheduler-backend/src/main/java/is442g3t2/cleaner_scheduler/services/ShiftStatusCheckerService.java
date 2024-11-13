package is442g3t2.cleaner_scheduler.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Collection.*;

import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.models.shift.ShiftStatus;
import is442g3t2.cleaner_scheduler.models.worker.Worker;
import is442g3t2.cleaner_scheduler.repositories.ShiftRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ShiftStatusCheckerService {

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private EmailSenderService emailSenderService;

    @Transactional
    @Scheduled(fixedRate = 60000)
    public void firstCheckShiftStatus() {
        log.info("Running first shift status check...");
        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        List<Shift> shiftsToCheck = new ArrayList<Shift>();

        List<Shift> shiftsFirstCheck = shiftRepository.findByShiftStatusAndStartTimeBefore(
                currentDate,
                currentTime.minusMinutes(5));
        LocalDateTime targetShift = LocalDateTime.of(currentDate, currentTime.minusMinutes(5));

        for (Shift shift : shiftsFirstCheck) {
            LocalDateTime currentShift = LocalDateTime.of(shift.getDate(), shift.getStartTime());
            if (isWithinMinute(currentShift , targetShift)) {
                shiftsToCheck.add(shift);
            }
        }

        log.info("Retrieved {} shifts to check", shiftsToCheck.size());

        for (Shift shift : shiftsToCheck) {
            if (shift.getPresentWorkers() == null ||
                    shift.getPresentWorkers().size() != shift.getWorkers().size()) {
                sendShiftStatusReminder(shift);
            }
        }
    }

    @Transactional
    private void sendShiftStatusReminder(Shift shift) {
        try {
            log.info("missing arrival image", shift.getId());
            List<Worker> workers = shift.getWorkers();
            ArrayList<String> supervisorEmails = new ArrayList<>();
            for (Worker worker : workers) {
                if (shift.getPresentWorkers() == null || !shift.getPresentWorkersAsSet().contains(worker.getId())) {
                    String supervisorEmail = worker.getSupervisorEmail();
                    if (!supervisorEmails.contains(supervisorEmail)) {
                        supervisorEmails.add(supervisorEmail);
                    }
                }
            }
            for (String email : supervisorEmails) {
                emailSenderService.sendFirstShiftAbsentEmail(email, shift);
            }
        } catch (Exception e) {
            log.info("Error updating shift status for shift {}: {}", shift.getId(), e.getMessage());
        }
    }

    @Transactional
    @Scheduled(fixedRate = 60000)
    public void secondCheckShiftStatus() {
        log.info("Running second shift status check...");
        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        List<Shift> shiftsToCheck = new ArrayList<Shift>();


        List<Shift> shiftsFirstCheck = shiftRepository.findByShiftStatusAndStartTimeBefore(
                currentDate,
                currentTime.minusMinutes(15));
        LocalDateTime targetShift = LocalDateTime.of(currentDate, currentTime.minusMinutes(15));
        
        for (Shift shift : shiftsFirstCheck) {
            LocalDateTime currentShift = LocalDateTime.of(shift.getDate(), shift.getStartTime());
            if (isWithinMinute(currentShift , targetShift)) {
                shiftsToCheck.add(shift);
            }
        }

        for (Shift shift : shiftsToCheck) {
            if (shift.getPresentWorkers() == null ||
                    shift.getPresentWorkers().size() != shift.getWorkers().size()) {
                sendSecondShiftStatusReminder(shift);
            }
        }
    }

    @Transactional
    private void sendSecondShiftStatusReminder(Shift shift) {
        try {
            if (shift.getPresentWorkers() == null) {
                shift.setStatus(ShiftStatus.ABSENT);
                log.info("Shift {} marked as CANCELLED due to no present workers");
            }
            shiftRepository.save(shift);
            List<Worker> workers = shift.getWorkers();
            ArrayList<String> supervisorEmails = new ArrayList<>();
            for (Worker worker : workers) {
                if (shift.getPresentWorkers() == null || !shift.getPresentWorkersAsSet().contains(worker.getId())) {
                    String supervisorEmail = worker.getSupervisorEmail();
                    if (!supervisorEmails.contains(supervisorEmail)) {
                        supervisorEmails.add(supervisorEmail);
                    }
                }
            }
            for (String email : supervisorEmails) {
                emailSenderService.sendSecondShiftAbsentEmail(email, shift);
            }
        } catch (Exception e) {
            log.info("Error updating shift status for shift {}: {}", shift.getId(), e.getMessage());
        }
    }

    

    private boolean isWithinMinute(LocalDateTime now, LocalDateTime target) {
        return now.getMinute() == target.getMinute() && now.getSecond() >= 0 && now.getSecond() < 60;
    }
}
