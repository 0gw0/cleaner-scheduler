package is442g3t2.cleaner_scheduler.services;

import is442g3t2.cleaner_scheduler.models.shift.CompletionImage;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.models.worker.Worker;
import is442g3t2.cleaner_scheduler.models.property.Property;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailSenderService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String token) {

        String subject = "Complete your registration";
        String link = "http://localhost:8080/workers/verify?token=" + token;
        String body = "Click the following link to complete your registration: " + link;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("fraserchua545@gmail.com");
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);

        System.out.println("Mail sent successfully...");
    }

    public void sendFirstShiftAbsentEmail(String toEmail, Shift shift) {

        String subject = "Shift Absence Notification - Shift ID: " + shift.getId();

        StringBuilder body = new StringBuilder();
        body.append("Dear Supervisor,\n\n");
        body.append("This is to inform you that workers are absent for the following shift:\n\n");
        body.append("Shift Details:\n");
        body.append("- Shift ID: ").append(shift.getId()).append("\n");
        body.append("- Date: ").append(shift.getDate()).append("\n");
        body.append("- Time: ").append(shift.getStartTime()).append(" - ").append(shift.getEndTime()).append("\n");
        body.append("- Location: ").append(shift.getProperty().getAddress()).append("\n\n");

        body.append("Absent Workers:\n");

        for (Worker worker : shift.getWorkers()) {
            if (!shift.getPresentWorkersAsSet().contains(worker.getId())) {
                body.append("- ").append(worker.getName()).append(" (ID: ").append(worker.getId()).append(")\n");
            }
        }

        if (shift.getPresentWorkers() == null) {
            body.append(
                    "\nPlease take necessary actions regarding this absence. The shift's status will be updated to Absent in 10 minutes if the worker(s) have not uploaded their acknowledgement image");
        } else {
            body.append(
                    "\nPlease take necessary actions regarding this absence.");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("fraserchua545@gmail.com");
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body.toString());

        mailSender.send(message);

        System.out.println("First absence notification mail sent successfully...");
    }

    public void sendSecondShiftAbsentEmail(String toEmail, Shift shift) {

        String subject = "Shift Absence Notification - Shift ID: " + shift.getId();

        StringBuilder body = new StringBuilder();
        body.append("Dear Supervisor,\n\n");
        body.append("This is to inform you that workers are absent for the following shift:\n\n");
        body.append("Shift Details:\n");
        body.append("- Shift ID: ").append(shift.getId()).append("\n");
        body.append("- Date: ").append(shift.getDate()).append("\n");
        body.append("- Time: ").append(shift.getStartTime()).append(" - ").append(shift.getEndTime()).append("\n");
        body.append("- Location: ").append(shift.getProperty().getAddress()).append("\n\n");

        body.append("Absent Workers:\n");
        for (Worker worker : shift.getWorkers()) {
            body.append("- ").append(worker.getName()).append(" (ID: ").append(worker.getId()).append(")\n");
        }

        if (shift.getPresentWorkers() == null) {
            body.append(
                    "\nThe Shift status has been updated to Absent due to no present workers at the shift. Status of the shift can be overidden in Task page");
        } else {
            body.append(
                    "The shift status is in-progress however please take necessary actions regarding this absence.");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("fraserchua545@gmail.com");
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body.toString());

        mailSender.send(message);

        System.out.println("Second absence notification mail sent successfully...");
    }

    public void sendAbsentCompletionEmail(String toEmail, Shift shift) {

        String subject = "Shift Absence Notification - Shift ID: " + shift.getId();

        StringBuilder body = new StringBuilder();
        body.append("Dear Supervisor,\n\n");
        body.append("This is to inform you that workers have not uploaded their completion image:\n\n");
        body.append("Shift Details:\n");
        body.append("- Shift ID: ").append(shift.getId()).append("\n");
        body.append("- Date: ").append(shift.getDate()).append("\n");
        body.append("- Time: ").append(shift.getStartTime()).append(" - ").append(shift.getEndTime()).append("\n");
        body.append("- Location: ").append(shift.getProperty().getAddress()).append("\n\n");

        body.append("Workers that have not uploaded Completion image:\n");

        Set<Long> workerUploadedImage = new HashSet<>();
        Set<Long> workerMissingImage = new HashSet<>();

        for (CompletionImage image : shift.getCompletionImages()) {
            workerUploadedImage.add(Long.valueOf(image.getWorkerId()));
        }

        for (Long workerId : shift.getWorkerIds()) {
            if (!workerUploadedImage.contains(workerId)) {
                workerMissingImage.add(workerId);
            }
        }

        for (Worker worker : shift.getWorkers()) {
            if (workerMissingImage.contains(worker.getId())) {
                body.append("- ").append(worker.getName())
                        .append(" (ID: ").append(worker.getId()).append(")\n");
            }
        }

        if (shift.getPresentWorkers() == null) {
            body.append(
                    "\nThe Shift status has not been updated to Completed due to missing Completion image for the shift. Status of the shift can be overidden in Task page");
        } else {
            body.append(
                    "The shift status is Completed however please take necessary actions regarding this issue.");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("fraserchua545@gmail.com");
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body.toString());

        mailSender.send(message);

        System.out.println("Second absence notification mail sent successfully...");
    }
}
