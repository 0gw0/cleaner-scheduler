package is442g3t2.cleaner_scheduler.repositories;

import is442g3t2.cleaner_scheduler.models.leave.AnnualLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnnualLeaveRepository extends JpaRepository<AnnualLeave, Long> {
    // Find all leaves for a worker
    List<AnnualLeave> findByWorkerId(Long workerId);

    // Find leaves between dates
    List<AnnualLeave> findByWorkerIdAndStartDateBetween(
            Long workerId,
            LocalDate startDate,
            LocalDate endDate
    );

    // Find by status
    List<AnnualLeave> findByWorkerIdAndStatus(Long workerId, String status);

    // Find overlapping leaves
    @Query("SELECT al FROM AnnualLeave al " +
            "WHERE al.worker.id = :workerId " +
            "AND ((al.startDate BETWEEN :startDate AND :endDate) " +
            "OR (al.endDate BETWEEN :startDate AND :endDate))")
    List<AnnualLeave> findOverlappingLeaves(
            @Param("workerId") Long workerId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}