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

    // scheduler function for checking if arrival image uploaded 5 minutes after shift started
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
            if (isWithinMinute(currentShift , targetShift) && isWithinHour(currentShift, targetShift)) {
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
            log.info("Error sending first shift status reminder {}: {}", shift.getId(), e.getMessage());
        }
    }

    // scheduler function for checking if arrival image uploaded 15 minutes after shift started
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
            if (isWithinMinute(currentShift , targetShift) && isWithinHour(currentShift, targetShift)) {
                shiftsToCheck.add(shift);
            }
        }

        log.info("Retrieved {} shifts to check", shiftsToCheck.size());

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

    // scheduler function for checking if completion image uploaded 15 minutes after shift ended
    @Transactional
    @Scheduled(fixedRate = 60000)
    public void completionImageCheck() {
        log.info("Running completion image check...");
        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        List<Shift> shiftsToCheck = new ArrayList<Shift>();
        
        List<Shift> completionImageCheck = shiftRepository.findByShiftStatusAndEndTimeAfter(
                currentDate,
                currentTime);
        LocalDateTime targetShift = LocalDateTime.of(currentDate, currentTime);
        log.info("TargetShift to check", completionImageCheck);
        log.info("Current target shift: {}", targetShift);

        for (Shift shift : completionImageCheck) {
            LocalDateTime currentShift = LocalDateTime.of(shift.getDate(), shift.getEndTime().plusMinutes(15));
            log.info("Current target shift vs CurrentShift: {} vs {}", targetShift, currentShift);
            if (isWithinMinute(currentShift , targetShift) && isWithinHour(currentShift, targetShift)) {
                shiftsToCheck.add(shift);
            }
        }

        log.info("Retrieved {} shifts to check", shiftsToCheck.size());

        for (Shift shift : shiftsToCheck) {
            if (shift.getPresentWorkers() == null ||
                    shift.getPresentWorkers().size() != shift.getWorkers().size()) {
                        
                        // for (Long workerId : shift.getPresentWorkers()) {
                        //     log.info("Worker part of getPresentWorkersAsSet {} and type {}", workerId, workerId.getClass());
                        // }
                sendCompletionImageReminder(shift);
            }
        }
    }

    @Transactional
    private void sendCompletionImageReminder(Shift shift) {
        try {
            log.info("missing completition image", shift.getId());
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
                emailSenderService.sendAbsentCompletionEmail(email, shift);
            }
        } catch (Exception e) {
            log.info("Error sending completion image reminder {}: {}", shift.getId(), e.getMessage());
        }
    }

    // check if shift is within same minute
    private boolean isWithinMinute(LocalDateTime now, LocalDateTime target) {
        return now.getMinute() == target.getMinute() && now.getSecond() >= 0 && now.getSecond() < 60;
    }

        // check if shift is within same minute
    private boolean isWithinHour(LocalDateTime now, LocalDateTime target) {
        return now.getHour() == target.getHour() && 
               now.getMinute() >= 0 && 
               now.getMinute() < 60;
    }

}



