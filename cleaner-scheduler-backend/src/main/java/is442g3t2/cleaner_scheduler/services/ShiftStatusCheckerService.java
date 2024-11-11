package is442g3t2.cleaner_scheduler.services;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

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

        List<Shift> shiftsToCheck = shiftRepository.findByShiftStatusAndStartTimeBefore(
            currentDate,
            currentTime.minusMinutes(5)
        );

        for (Shift shift : shiftsToCheck) {
            sendShiftStatusReminder(shift);
        
        }
    }


    @Transactional
    @Scheduled(fixedRate = 60000) 
    public void secondCheckShiftStatus() {
        log.info("Running second shift status check...");
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

    @Transactional 
    private void sendShiftStatusReminder(Shift shift) {
        try {
            if (shift.getArrivalImage() == null) {
                log.info("missing arrival image", shift.getId());
                List<Worker> workers = shift.getWorkers();
                ArrayList<String> supervisorEmails = new ArrayList<>(); 
                for (Worker worker : workers) {
                    String supervisorEmail = worker.getSupervisorEmail();
                    if (!supervisorEmails.contains(supervisorEmail)) {
                        supervisorEmails.add(supervisorEmail);
                    }
                }
                for (String email : supervisorEmails) {
                    emailSenderService.sendFirstShiftAbsentEmail(email, shift);
                }
            }
        } catch (Exception e) {
            log.info("Error updating shift status for shift {}: {}", shift.getId(), e.getMessage());
        }
    }

    @Transactional 
    private void updateShiftStatus(Shift shift) {
        try {
            if (shift.getArrivalImage() == null) {
                shift.setStatus(ShiftStatus.ABSENT);
                log.info("Shift {} marked as CANCELLED due to missing arrival image", shift.getId());
            } 
            shiftRepository.save(shift);
            List<Worker> workers = shift.getWorkers();
            ArrayList<String> supervisorEmails = new ArrayList<>(); 
            for (Worker worker : workers) {
                String supervisorEmail = worker.getSupervisorEmail();
                if (!supervisorEmails.contains(supervisorEmail)) {
                    supervisorEmails.add(supervisorEmail);
                }
            }
            for (String email : supervisorEmails) {
                emailSenderService.sendSecondShiftAbsentEmail(email, shift);
            }
        } catch (Exception e) {
            log.info("Error updating shift status for shift {}: {}", shift.getId(), e.getMessage());
        }
    }
}
