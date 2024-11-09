package is442g3t2.cleaner_scheduler.repositories;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import is442g3t2.cleaner_scheduler.models.shift.Shift;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {

        // List<Shift> findByShiftStatusAndStartTimeBefore(ShiftStatus status, LocalDateTime dateTime);
        @Query("SELECT s FROM Shift s WHERE s.date = :currentDate AND s.startTime <= :checkTime AND s.status = 'UPCOMING'")
        List<Shift> findByShiftStatusAndStartTimeBefore(
            @Param("currentDate") LocalDate currentDate,
            @Param("checkTime") LocalTime checkTime
        );
}