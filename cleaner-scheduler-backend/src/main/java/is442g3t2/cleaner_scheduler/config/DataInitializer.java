package is442g3t2.cleaner_scheduler.config;

import is442g3t2.cleaner_scheduler.models.Admin;
import is442g3t2.cleaner_scheduler.models.Worker;
import is442g3t2.cleaner_scheduler.models.Shift;
import is442g3t2.cleaner_scheduler.repositories.AdminRepository;
import is442g3t2.cleaner_scheduler.repositories.WorkerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(AdminRepository adminRepository, WorkerRepository workerRepository) {
        return args -> {
            // Create and save Admins
            Admin admin1 = new Admin("Mr Admin", "A001");
            Admin admin2 = new Admin("Mrs VeryAdmin", "A002");
            adminRepository.save(admin1);
            adminRepository.save(admin2);

            // Create and save Workers
            Worker worker1 = new Worker("Mati", "W001", "1234567890", "eg bio 1");
            worker1.setSupervisor(admin1);
            worker1.addShift(new Shift(DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(17, 0)));
            worker1.addShift(new Shift(DayOfWeek.WEDNESDAY, LocalTime.of(9, 0), LocalTime.of(17, 0)));
            workerRepository.save(worker1);

            Worker worker2 = new Worker("Yati", "W002", "0987654321", "eg bio 2");
            worker2.setSupervisor(admin1);
            worker2.addShift(new Shift(DayOfWeek.TUESDAY, LocalTime.of(8, 0), LocalTime.of(16, 0)));
            worker2.addShift(new Shift(DayOfWeek.THURSDAY, LocalTime.of(8, 0), LocalTime.of(16, 0)));
            workerRepository.save(worker2);

            Worker worker3 = new Worker("Wati", "W003", "1122334455", "eg bio 3");
            worker3.setSupervisor(admin2);
            worker3.addShift(new Shift(DayOfWeek.FRIDAY, LocalTime.of(10, 0), LocalTime.of(14, 0)));
            workerRepository.save(worker3);

        };
    }
}