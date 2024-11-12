package is442g3t2.cleaner_scheduler.repositories;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import is442g3t2.cleaner_scheduler.models.property.Property;
import is442g3t2.cleaner_scheduler.models.shift.Shift;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {

    // List<Shift> findByShiftStatusAndStartTimeBefore(ShiftStatus status,
    // LocalDateTime dateTime);
    @Query("SELECT DISTINCT s FROM Shift s " +
            "LEFT JOIN FETCH s.workers " +
            "WHERE s.status = 'UPCOMING' AND s.date = :currentDate " +
            "AND s.startTime < :cutoffTime")
    List<Shift> findByShiftStatusAndStartTimeBefore(
            @Param("currentDate") LocalDate currentDate,
            @Param("cutoffTime") LocalTime cutoffTime);

    Optional<Shift> findByDateAndStartTimeAndEndTimeAndProperty(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            Property property);

    @Query("SELECT s FROM Shift s WHERE " +
            "(:status is null OR s.status = :status) AND " +
            "(:startDate is null OR s.startTime >= :startDate) AND " +
            "(:endDate is null OR s.startTime < :endDate)")
    List<Shift> findByFilters(@Param("status") String status,
                              @Param("startDate") LocalDateTime startDate,
                              @Param("endDate") LocalDateTime endDate);
}
