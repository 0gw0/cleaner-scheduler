package is442g3t2.cleaner_scheduler.services;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


@Service
public class TwilioSmsService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String fromPhoneNumber;

    public TwilioSmsService(
        @Value("${twilio.account.sid}") String accountSid,
        @Value("${twilio.auth.token}") String authToken,
        @Value("${twilio.phone.number}") String fromPhoneNumber
    ) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.fromPhoneNumber = fromPhoneNumber;

        Twilio.init(accountSid, authToken);
    }

    public void sendSms(String toPhoneNumber, String messageContent) {
        Message.creator(
            new com.twilio.type.PhoneNumber(toPhoneNumber),
            new com.twilio.type.PhoneNumber(fromPhoneNumber),
            messageContent
        ).create();
    }
}
