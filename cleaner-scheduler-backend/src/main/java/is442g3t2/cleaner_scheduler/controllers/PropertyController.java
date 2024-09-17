package is442g3t2.cleaner_scheduler.controllers;

import is442g3t2.cleaner_scheduler.models.Property;
import is442g3t2.cleaner_scheduler.repositories.PropertyRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/properties")
public class PropertyController {

    private final PropertyRepository propertyRepository;

    public PropertyController(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @GetMapping("")
    public ResponseEntity<List<Property>> getPropertiesByClient(@RequestParam(value = "clientId", required = false) Long clientId) {

        List<Property> properties;

        if (clientId == null) {
            properties = propertyRepository.findAll();
        } else {
            properties = propertyRepository.findByClientId(clientId);
        }

        if (properties.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(properties);
    }


}
