package is442g3t2.cleaner_scheduler.repositories;

import is442g3t2.cleaner_scheduler.models.Property;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByClientId(Long clientId);


}
