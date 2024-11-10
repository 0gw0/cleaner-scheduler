package is442g3t2.cleaner_scheduler.repositories;

import is442g3t2.cleaner_scheduler.models.leave.MedicalLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicalLeaveRepository extends JpaRepository<MedicalLeave, Long> {
    // Find all leaves for a worker
    List<MedicalLeave> findByWorkerId(Long workerId);

    // Find leaves between dates
    List<MedicalLeave> findByWorkerIdAndStartDateBetween(
            Long workerId,
            LocalDate startDate,
            LocalDate endDate
    );

    // Find by approval status
    List<MedicalLeave> findByWorkerIdAndIsApproved(Long workerId, boolean isApproved);

    // Find overlapping leaves
    @Query("SELECT ml FROM MedicalLeave ml " +
            "WHERE ml.worker.id = :workerId " +
            "AND ((ml.startDate BETWEEN :startDate AND :endDate) " +
            "OR (ml.endDate BETWEEN :startDate AND :endDate))")
    List<MedicalLeave> findOverlappingLeaves(
            @Param("workerId") Long workerId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
