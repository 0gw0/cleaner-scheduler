package is442g3t2.cleaner_scheduler.config;

import is442g3t2.cleaner_scheduler.exceptions.ShiftsOverlapException;
import is442g3t2.cleaner_scheduler.models.*;
import is442g3t2.cleaner_scheduler.models.leave.MedicalCertificate;
import is442g3t2.cleaner_scheduler.models.leave.MedicalLeave;
import is442g3t2.cleaner_scheduler.models.property.Property;
import is442g3t2.cleaner_scheduler.models.shift.ArrivalImage;
import is442g3t2.cleaner_scheduler.models.shift.CompletionImage;
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
import java.util.Set;

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
            Admin admin2 = new Admin("Mrs VeryAdmin", "password123", "f3qiog@gmail.com");
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
            Worker worker1 = new Worker("Fraser", "+6598470525", "eg bio 1", "email1@gmail.com", "password123", "188065");
            Worker worker2 = new Worker("Adrian", "+6583030321", "eg bio 2", "email2@gmail.com", "password123", "188065");
            Worker worker3 = new Worker("Henry", "+6584207195", "eg bio 3", "email3@gmail.com", "password123", "188065");
            Worker worker4 = new Worker("Min Tun", "+6596211649", "eg bio 4", "email4@gmail.com", "password123", "460416");
            Worker worker5 = new Worker("Wati", "+6596211649", "eg bio 5", "email5@gmail.com", "password123", "460416");
            Worker worker6 = new Worker("Lynn", "+6596211649", "eg bio 6", "email6@gmail.com", "password123", "460416");


            worker1.setSupervisor(admin1);
            worker2.setSupervisor(admin1);
            worker3.setSupervisor(admin1);
            worker4.setSupervisor(admin1);
            worker5.setSupervisor(admin1);
            worker6.setSupervisor(admin2);


            worker1.setIsVerified(true);
            worker2.setIsVerified(true);
            worker3.setIsVerified(true);
            worker4.setIsVerified(true);
            worker5.setIsVerified(true);
            worker6.setIsVerified(true);

            // Save workers first
            workerRepository.save(worker1);
            workerRepository.save(worker2);
            workerRepository.save(worker3);
            workerRepository.save(worker4);
            workerRepository.save(worker5);
            workerRepository.save(worker6);

            // Create shifts and assign workers
            Shift shift1 = new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 12),
                    LocalTime.of(9, 0),
                    LocalTime.of(17, 0),
                    property1,
                    ShiftStatus.COMPLETED
            );
            shift1.addArrivalImage(new ArrivalImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
            shift1.addCompletionImage(new CompletionImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
            shift1.setPresentWorkers(Set.of(1L));
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
            shift2.addWorker(worker6);
            shift2.setPresentWorkers(Set.of(1L,2L, 6L));
            shiftRepository.save(shift2);

            Shift shift3 = new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 13),
                    LocalTime.of(8, 0),
                    LocalTime.of(11, 0),
                    property1,
                    ShiftStatus.COMPLETED
            );
            shift3.addWorker(worker2);
            shift3.setPresentWorkers(Set.of(2L));
            shiftRepository.save(shift3);

            Shift shift4 = new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 25),
                    LocalTime.of(8, 0),
                    LocalTime.of(12, 0),
                    property1,
                    ShiftStatus.COMPLETED
            );
            shift4.addWorker(worker2);
            shift4.setPresentWorkers(Set.of(2L));
            shiftRepository.save(shift4);

            Shift shift5 = new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 26),
                    LocalTime.of(10, 0),
                    LocalTime.of(14, 0),
                    property2,
                    ShiftStatus.COMPLETED
            );
            shift5.addWorker(worker3);
            shift5.setPresentWorkers(Set.of(3L));
            shiftRepository.save(shift5);
        
            Shift shift7 = new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 19),
                    LocalTime.of(10, 0),
                    LocalTime.of(12, 0),
                    property1,
                    ShiftStatus.COMPLETED
            );
            shift7.addArrivalImage(new ArrivalImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
            shift7.addCompletionImage(new CompletionImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
            shift7.setPresentWorkers(Set.of(1L));
            shift7.addWorker(worker1);  // Use the new addWorker method
            shiftRepository.save(shift7);

            Shift shift8 = new Shift(
                    LocalDate.of(2024, Month.SEPTEMBER, 25),
                    LocalTime.of(13, 0),
                    LocalTime.of(17, 0),
                    property2,
                    ShiftStatus.COMPLETED
            );
            shift8.addWorker(worker1);
            shift8.addWorker(worker2);  // Adding multiple workers to the same shift
            shift8.setPresentWorkers(Set.of(1L,2L));
            shiftRepository.save(shift8);

            Shift shift9 = new Shift(
                        LocalDate.of(2024, Month.SEPTEMBER, 13),
                        LocalTime.of(15, 0),
                    LocalTime.of(18, 0),
                    property1,
                    ShiftStatus.COMPLETED
            );
            shift9.addArrivalImage(new ArrivalImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
            shift9.addCompletionImage(new CompletionImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
            shift9.setPresentWorkers(Set.of(1L));
            shift9.addWorker(worker1);  // Use the new addWorker method
            shiftRepository.save(shift9);

            Shift shift10 = new Shift(
                        LocalDate.of(2024, Month.SEPTEMBER, 13),
                        LocalTime.of(18, 30),
                    LocalTime.of(20, 30),
                    property1,
                    ShiftStatus.COMPLETED
            );
            shift10.addArrivalImage(new ArrivalImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
            shift10.addCompletionImage(new CompletionImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
            shift10.setPresentWorkers(Set.of(1L));
            shift10.addWorker(worker1);  // Use the new addWorker method
            shiftRepository.save(shift10);

            Shift shift11 = new Shift(
                        LocalDate.of(2024, Month.SEPTEMBER, 12),
                        LocalTime.of(8, 30),
                    LocalTime.of(20, 30),
                    property1,
                    ShiftStatus.COMPLETED
            );
            shift11.addArrivalImage(new ArrivalImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
            shift11.addCompletionImage(new CompletionImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
            shift11.setPresentWorkers(Set.of(1L));
            shift11.addWorker(worker1);  // Use the new addWorker method
            shiftRepository.save(shift11);

            Shift shift12 = new Shift(
                        LocalDate.of(2024, Month.SEPTEMBER, 10),
                        LocalTime.of(8, 30),
                    LocalTime.of(20, 30),
                    property1,
                    ShiftStatus.COMPLETED
            );
            shift12.addArrivalImage(new ArrivalImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
            shift12.addCompletionImage(new CompletionImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
            shift12.setPresentWorkers(Set.of(1L));
            shift12.addWorker(worker1);  // Use the new addWorker method
            shiftRepository.save(shift12);

            
        Shift shift13 = new Shift(
        LocalDate.of(2024, Month.NOVEMBER, 11),
        LocalTime.of(8, 30),
        LocalTime.of(20, 30),
        property1,
        ShiftStatus.COMPLETED
        );
        shift13.addArrivalImage(new ArrivalImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
        shift13.addCompletionImage(new CompletionImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
        shift13.setPresentWorkers(Set.of(1L));
        shift13.addWorker(worker1);
        shiftRepository.save(shift13);

        Shift shift14 = new Shift(
        LocalDate.of(2024, Month.NOVEMBER, 12),
        LocalTime.of(8, 30),
        LocalTime.of(20, 30),
        property1,
        ShiftStatus.COMPLETED
        );
        shift14.addArrivalImage(new ArrivalImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
        shift14.addCompletionImage(new CompletionImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
        shift14.setPresentWorkers(Set.of(1L));
        shift14.addWorker(worker1);
        shiftRepository.save(shift14);

        Shift shift15 = new Shift(
                LocalDate.of(2024, Month.NOVEMBER, 8),
                LocalTime.of(8, 30),
                LocalTime.of(20, 30),
                property1,
                ShiftStatus.COMPLETED
                );
                shift15.addArrivalImage(new ArrivalImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
                shift15.addCompletionImage(new CompletionImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
                shift15.setPresentWorkers(Set.of(1L));
                shift15.addWorker(worker1);
                shiftRepository.save(shift15);

        Shift shift16 = new Shift(
                        LocalDate.of(2024, Month.NOVEMBER, 7),
                        LocalTime.of(8, 30),
                        LocalTime.of(20, 30),
                        property1,
                        ShiftStatus.COMPLETED
                        );
                        shift16.addArrivalImage(new ArrivalImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
                        shift16.addCompletionImage(new CompletionImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
                        shift16.setPresentWorkers(Set.of(1L));
                        shift16.addWorker(worker1);
                        shiftRepository.save(shift16);
        Shift shift17 = new Shift(
                LocalDate.of(2024, Month.NOVEMBER, 7),
                LocalTime.of(8, 30),
                LocalTime.of(20, 30),
                property1,
                ShiftStatus.COMPLETED
                );
                shift17.addArrivalImage(new ArrivalImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
                shift17.addCompletionImage(new CompletionImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
                shift17.setPresentWorkers(Set.of(1L));
                shift17.addWorker(worker2);
                shiftRepository.save(shift17);
        Shift shift18 = new Shift(
                        LocalDate.of(2024, Month.NOVEMBER, 6),
                        LocalTime.of(8, 30),
                        LocalTime.of(20, 30),
                        property1,
                        ShiftStatus.COMPLETED
                        );
                        shift18.addArrivalImage(new ArrivalImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
                        shift18.addCompletionImage(new CompletionImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
                        shift18.setPresentWorkers(Set.of(1L));
                        shift18.addWorker(worker1);
                        shiftRepository.save(shift18);
        
        Shift shift19 = new Shift(
                                LocalDate.of(2024, Month.NOVEMBER, 5),
                                LocalTime.of(8, 30),
                                LocalTime.of(20, 30),
                                property1,
                                ShiftStatus.COMPLETED
                                );
                                shift19.addArrivalImage(new ArrivalImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
                                shift19.addCompletionImage(new CompletionImage("arrivals/1/resized_image.jpg", LocalDateTime.now(), "resized_image.jpg", worker1.getId()));
                                shift19.setPresentWorkers(Set.of(1L));
                                shift19.addWorker(worker1);
                                shiftRepository.save(shift19);
        
        try {
        Shift shift6 = new Shift(
                        LocalDate.of(2024, Month.NOVEMBER, 25),
                        LocalTime.of(10, 0),
                        LocalTime.of(14, 0),
                        property2,
                        ShiftStatus.UPCOMING
                );
                shift6.addWorker(worker1);
                shiftRepository.save(shift6);
            } catch (Exception e) {
                System.out.println(e.getMessage());
            }

        try {
        Shift shift20 = new Shift(
                        LocalDate.of(2024, Month.NOVEMBER, 15),
                        LocalTime.of(10, 15),
                        LocalTime.of(13, 00),
                        property2,
                        ShiftStatus.UPCOMING
                );
                shift20.addWorker(worker1);
                shiftRepository.save(shift20);
                } catch (Exception e) {
                System.out.println(e.getMessage());
        }


        try {
        Shift shift21 = new Shift(
                        LocalDate.of(2024, Month.NOVEMBER, 15),
                        LocalTime.of(9, 55),
                        LocalTime.of(13, 00),
                        property2,
                        ShiftStatus.UPCOMING
                );
                shift21.addWorker(worker1);
                shiftRepository.save(shift21);
                } catch (Exception e) {
                System.out.println(e.getMessage());
        }

        try {
                Shift shift22 = new Shift(
                                LocalDate.of(2024, Month.NOVEMBER, 15),
                                LocalTime.of(10, 05),
                                LocalTime.of(13, 00),
                                property2,
                                ShiftStatus.UPCOMING
                        );
                        shift22.addWorker(worker1);
                        shiftRepository.save(shift22);
                        } catch (Exception e) {
                        System.out.println(e.getMessage());
        }
        

            
            // Add some leave records
            worker1.takeLeave(LocalDate.of(2024, Month.SEPTEMBER, 10), LocalDate.of(2024, Month.SEPTEMBER, 10));
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