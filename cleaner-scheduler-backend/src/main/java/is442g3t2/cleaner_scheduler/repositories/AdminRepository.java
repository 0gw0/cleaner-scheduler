package is442g3t2.cleaner_scheduler.repositories;

import is442g3t2.cleaner_scheduler.models.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByEmployeeId(String employeeId);

}
