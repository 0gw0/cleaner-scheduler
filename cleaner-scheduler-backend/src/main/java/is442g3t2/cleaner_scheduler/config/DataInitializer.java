package is442g3t2.cleaner_scheduler.config;

import is442g3t2.cleaner_scheduler.exceptions.ShiftsOverlapException;
import is442g3t2.cleaner_scheduler.models.*;
import is442g3t2.cleaner_scheduler.models.property.Property;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.models.worker.Worker;
import is442g3t2.cleaner_scheduler.repositories.AdminRepository;
import is442g3t2.cleaner_scheduler.repositories.ClientRepository;

import is442g3t2.cleaner_scheduler.repositories.WorkerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Month;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(AdminRepository adminRepository, WorkerRepository workerRepository, ClientRepository clientRepository) {
        return args -> {
            // Create and save Admins
            Admin admin1 = new Admin("Mr Admin");
            Admin admin2 = new Admin("Mrs VeryAdmin");
            adminRepository.save(admin1);
            adminRepository.save(admin2);


            // Create and save clients with properties
            Client client1 = new Client("Mrs Client1");
            Client client2 = new Client("Mr Client2");
            Property property1 = new Property("Client1 Rd", "238826");
            Property property2 = new Property("Client2 Rd", "820168");
            client1.addProperty(property1);
            client2.addProperty(property2);
            clientRepository.save(client1);
            clientRepository.save(client2);

            // Create and save Workers with shifts
            Worker worker1 = new Worker("Mati", "1234567890", "eg bio 1");
            worker1.setSupervisor(admin1);
            worker1.addShift(new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 12),
                    LocalTime.of(9, 0),
                    LocalTime.of(17, 0),
                    property1));
            worker1.addShift(new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 16),
                    LocalTime.of(9, 0),
                    LocalTime.of(17, 0),
                    property2));
            worker1.takeLeave(LocalDate.of(2024, Month.SEPTEMBER, 10), LocalDate.of(2024, Month.SEPTEMBER, 10));
            worker1.takeLeave(LocalDate.of(2023, Month.SEPTEMBER, 10), LocalDate.of(2024, Month.SEPTEMBER, 10));
            workerRepository.save(worker1);

            Worker worker2 = new Worker("Yati", "0987654321", "eg bio 2");
            worker2.setSupervisor(admin1);
            worker2.addShift(new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 13),
                    LocalTime.of(8, 0),
                    LocalTime.of(16, 0),
                    property1));
            worker2.addShift(new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 16),
                    LocalTime.of(8, 0),
                    LocalTime.of(16, 0),
                    property1));
            worker2.addShift(new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 25),
                    LocalTime.of(8, 0),
                    LocalTime.of(12, 0),
                    property1));
            workerRepository.save(worker2);

            Worker worker3 = new Worker("Wati", "1122334455", "eg bio 3");
            worker3.setSupervisor(admin2);
            worker3.addShift(new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 26),
                    LocalTime.of(10, 0),
                    LocalTime.of(14, 0),
                    property2));
            try {
                worker3.addShift(new Shift(
                        LocalDate.of(2024, Month.SEPTEMBER, 25),
                        LocalTime.of(10, 0),
                        LocalTime.of(14, 0),
                        property2));
            } catch (ShiftsOverlapException e) {
                System.out.println(e.getMessage());
            }
            workerRepository.save(worker3);


        };
    }
}