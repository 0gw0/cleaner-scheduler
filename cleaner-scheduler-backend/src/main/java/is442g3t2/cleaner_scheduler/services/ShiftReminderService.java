// package is442g3t2.cleaner_scheduler.services;


// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.scheduling.annotation.Scheduled;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import is442g3t2.cleaner_scheduler.models.shift.Shift;

// import java.time.LocalDateTime;
// import java.util.List;

// @Service
// public class ShiftReminderService {
//     @Autowired
//     private ShiftService shiftService;
//     @Autowired
//     private TwilioSmsService twilioSmsService;

//     @Transactional
//     @Scheduled(fixedRate = 60000)
//     public void sendUpcomingShiftReminders() {
//         List<Shift> upcomingShifts = shiftService.getUpcomingShifts();
//         for (Shift shift : upcomingShifts) {
//             LocalDateTime shiftStartTime = LocalDateTime.of(shift.getDate(), shift.getStartTime());
//             LocalDateTime firstReminderTime = shiftStartTime.minusMinutes(10);
//             LocalDateTime secondReminderTime = shiftStartTime.minusMinutes(5);

//             if (isWithinMinute(LocalDateTime.now(), firstReminderTime)) {
//                 sendShiftReminder(shift, 10);
//             }

//             if (isWithinMinute(LocalDateTime.now(), secondReminderTime)) {
//                 sendShiftReminder(shift, 5);
//             }
//         }
//     }

//     private boolean isWithinMinute(LocalDateTime now, LocalDateTime target) {
//         return now.getMinute() == target.getMinute() && now.getSecond() >= 0 && now.getSecond() < 60;
//     }


//     private void sendShiftReminder(Shift shift, int minutesBeforeStart) {
//         String workerPhoneNumber = shift.getWorkers().iterator().next().getPhoneNumber(); // Adjust if multiple workers
//         String messageContent = "Reminder: Your shift at " + shift.getProperty().getAddress() +
//                 " starts in " + minutesBeforeStart + " minutes, at " + shift.getStartTime() + " on " + shift.getDate() + ".";
//         twilioSmsService.sendSms(workerPhoneNumber, messageContent);
//     }
// }