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
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Month;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(AdminRepository adminRepository, WorkerRepository workerRepository) {
        return args -> {
            // Create and save Admins
            Admin admin1 = new Admin("Mr Admin");
            Admin admin2 = new Admin("Mrs VeryAdmin");
            adminRepository.save(admin1);
            adminRepository.save(admin2);

            // Create and save Workers
            Worker worker1 = new Worker("Mati", "1234567890", "eg bio 1");
            worker1.setSupervisor(admin1);
            worker1.addShift(new Shift(LocalDate.of(2024, Month.SEPTEMBER, 12), LocalTime.of(9, 0), LocalTime.of(17, 0)));
            worker1.addShift(new Shift(LocalDate.of(2024, Month.SEPTEMBER, 16), LocalTime.of(9, 0), LocalTime.of(17, 0)));
            workerRepository.save(worker1);

            Worker worker2 = new Worker("Yati", "0987654321", "eg bio 2");
            worker2.setSupervisor(admin1);
            worker2.addShift(new Shift(LocalDate.of(2024, Month.SEPTEMBER, 13), LocalTime.of(8, 0), LocalTime.of(16, 0)));
            worker2.addShift(new Shift(LocalDate.of(2024, Month.SEPTEMBER, 16), LocalTime.of(8, 0), LocalTime.of(16, 0)));
            workerRepository.save(worker2);

            Worker worker3 = new Worker("Wati", "1122334455", "eg bio 3");
            worker3.setSupervisor(admin2);
            worker3.addShift(new Shift(LocalDate.of(2024, Month.SEPTEMBER, 22), LocalTime.of(10, 0), LocalTime.of(14, 0)));
            workerRepository.save(worker3);

        };
    }
}