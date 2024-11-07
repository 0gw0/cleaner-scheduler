package is442g3t2.cleaner_scheduler.services;
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
}
