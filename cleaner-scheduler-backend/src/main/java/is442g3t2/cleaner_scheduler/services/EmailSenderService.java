package is442g3t2.cleaner_scheduler.services;

import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.models.worker.Worker;
import is442g3t2.cleaner_scheduler.models.property.Property;
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
            body.append("- ").append(worker.getName()).append(" (ID: ").append(worker.getId()).append(")\n");
        }
        
        body.append("\nPlease take necessary actions regarding this absence. The Shift status will be updated to Absent in 10 minutes if the worker(s) have not uploaded their acknowledgement image");

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
        
        body.append("\nPlease take necessary actions regarding this absence. The Shift status has been updated to Absent but can be overidden in some page");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("fraserchua545@gmail.com");
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body.toString());

        mailSender.send(message);

        System.out.println("Second absence notification mail sent successfully...");
    }
}
