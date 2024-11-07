package is442g3t2.cleaner_scheduler;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CleanerSchedulerBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CleanerSchedulerBackendApplication.class, args);
    }

}
