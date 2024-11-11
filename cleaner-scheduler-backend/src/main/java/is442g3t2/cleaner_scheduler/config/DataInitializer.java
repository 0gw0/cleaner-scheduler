package is442g3t2.cleaner_scheduler.config;

import is442g3t2.cleaner_scheduler.exceptions.ShiftsOverlapException;
import is442g3t2.cleaner_scheduler.models.*;
import is442g3t2.cleaner_scheduler.models.leave.MedicalCertificate;
import is442g3t2.cleaner_scheduler.models.leave.MedicalLeave;
import is442g3t2.cleaner_scheduler.models.property.Property;
import is442g3t2.cleaner_scheduler.models.shift.ArrivalImage;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.models.shift.ShiftStatus;
import is442g3t2.cleaner_scheduler.models.worker.Worker;
import is442g3t2.cleaner_scheduler.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Month;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(
            AdminRepository adminRepository,
            WorkerRepository workerRepository,
            ClientRepository clientRepository,
            ShiftRepository shiftRepository
    ) {
        return args -> {
            // Create and save Admins
            Admin admin1 = new Admin("Mr Admin", "password123", "fraserlishious@gmail.com");
            Admin admin2 = new Admin("Mrs VeryAdmin", "password123", "admin2@gmail.com");
            Admin admin3 = new Admin("Super Admin", "password123", "admin3@gmail.com");
            adminRepository.save(admin1);
            adminRepository.save(admin2);
            admin3.setRoot(true);
            adminRepository.save(admin3);


            // Create and save clients with properties
            Client client1 = new Client("Mrs Client1");
            Client client2 = new Client("Mr Client2");
            Property property1 = new Property("Client1 Rd", "238826");
            Property property2 = new Property("Client2 Rd", "820168");
            client1.addProperty(property1);
            client2.addProperty(property2);
            clientRepository.save(client1);
            clientRepository.save(client2);

            // Create Workers
            Worker worker1 = new Worker("Mati", "1234567890", "eg bio 1", "email1@gmail.com", "password123");
            Worker worker2 = new Worker("Yati", "0987654321", "eg bio 2", "email2@gmail.com", "password123");
            Worker worker3 = new Worker("Wati", "1122334455", "eg bio 3", "email3@gmail.com", "password123");

            worker1.setSupervisor(admin1);
            worker2.setSupervisor(admin1);
            worker3.setSupervisor(admin2);

            worker1.setIsVerified(true);
            worker2.setIsVerified(true);
            worker3.setIsVerified(true);

            // Save workers first
            workerRepository.save(worker1);
            workerRepository.save(worker2);
            workerRepository.save(worker3);

            // Create shifts and assign workers
            Shift shift1 = new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 12),
                    LocalTime.of(9, 0),
                    LocalTime.of(17, 0),
                    property1,
                    ShiftStatus.COMPLETED
            );
            shift1.setArrivalImage(new ArrivalImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg"));
            shift1.addWorker(worker1);  // Use the new addWorker method
            shiftRepository.save(shift1);

            Shift shift2 = new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 16),
                    LocalTime.of(9, 0),
                    LocalTime.of(17, 0),
                    property2,
                    ShiftStatus.COMPLETED
            );
            shift2.addWorker(worker1);
            shift2.addWorker(worker2);  // Adding multiple workers to the same shift
            shiftRepository.save(shift2);

            Shift shift3 = new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 13),
                    LocalTime.of(8, 0),
                    LocalTime.of(16, 0),
                    property1,
                    ShiftStatus.COMPLETED
            );
            shift3.addWorker(worker2);
            shiftRepository.save(shift3);

            Shift shift4 = new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 25),
                    LocalTime.of(8, 0),
                    LocalTime.of(12, 0),
                    property1,
                    ShiftStatus.COMPLETED
            );
            shift4.addWorker(worker2);
            shiftRepository.save(shift4);

            Shift shift5 = new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 26),
                    LocalTime.of(10, 0),
                    LocalTime.of(14, 0),
                    property2,
                    ShiftStatus.COMPLETED
            );
            shift5.addWorker(worker3);
            shiftRepository.save(shift5);

            try {
                Shift shift6 = new Shift(
                        LocalDate.of(2025, Month.SEPTEMBER, 25),
                        LocalTime.of(10, 0),
                        LocalTime.of(14, 0),
                        property2,
                        ShiftStatus.UPCOMING
                );
                shift6.addWorker(worker3);
                shiftRepository.save(shift6);
            } catch (Exception e) {
                System.out.println(e.getMessage());
            }

            // Add some leave records
            worker1.takeLeave(LocalDate.of(2024, Month.SEPTEMBER, 10), LocalDate.of(2024, Month.SEPTEMBER, 10));
            worker1.takeLeave(LocalDate.of(2023, Month.SEPTEMBER, 10), LocalDate.of(2024, Month.SEPTEMBER, 10));
            MedicalLeave medicalLeaveWithoutMC = new MedicalLeave(worker1, LocalDate.of(2024, Month.SEPTEMBER, 10), LocalDate.of(2024, Month.SEPTEMBER, 10));
            MedicalLeave medicalLeaveWithMC = new MedicalLeave(worker1, LocalDate.of(2024, Month.AUGUST, 10), LocalDate.of(2024, Month.AUGUST, 10));
            MedicalCertificate mc = new MedicalCertificate("medical-certificates/1_2024-09-15_f666e8aa-81fe-4521-bb59-5a45db272194.pdf", "Week 1 Quiz.pdf");
            medicalLeaveWithMC.setMedicalCertificate(mc);
            worker1.takeMedicalLeave(medicalLeaveWithoutMC);
            worker1.takeMedicalLeave(medicalLeaveWithMC);


            // Save workers again to update their relationships
            workerRepository.save(worker1);
            workerRepository.save(worker2);
            workerRepository.save(worker3);
        };
    }
}