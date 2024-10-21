package is442g3t2.cleaner_scheduler.repositories;

import is442g3t2.cleaner_scheduler.models.shift.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
}