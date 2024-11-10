package is442g3t2.cleaner_scheduler.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import is442g3t2.cleaner_scheduler.models.property.Property;
import is442g3t2.cleaner_scheduler.repositories.PropertyRepository;
import is442g3t2.cleaner_scheduler.repositories.ClientRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import is442g3t2.cleaner_scheduler.dto.property.PostPropertyRequest;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/properties")
public class PropertyController {

    private final PropertyRepository propertyRepository;
    private final ClientRepository clientRepository;

    public PropertyController(PropertyRepository propertyRepository, ClientRepository clientRepository) {
        this.propertyRepository = propertyRepository;
        this.clientRepository = clientRepository;

    }

    @GetMapping("")
    @Tag(name = "properties")
    @Operation(summary = "get ALL properties belonging to a client with client id", description = "get ALL properties belonging to a client with client id")
    public ResponseEntity<List<Property>> getPropertiesByClient(@RequestParam(value = "clientId", required = false) Long clientId, @RequestParam(value = "includeInactive", defaultValue = "false") boolean includeInactive) {

        List<Property> properties;

        if (clientId == null) {
            properties = propertyRepository.findAll();
        } else {
            properties = propertyRepository.findByClientId(clientId);
        }

        if (!includeInactive) {
        properties = properties.stream()
                .filter(Property::isActive)
                .collect(Collectors.toList());
        }

        if (properties.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(properties);
    }

    @PostMapping("")
    @Tag(name = "properties")
    @Operation(summary = "Create a new property", description = "Create a new property for a client")
    public ResponseEntity<Property> createProperty(@RequestBody PostPropertyRequest postPropertyRequest) {
        Property property = new Property();
        property.setAddress(postPropertyRequest.getAddress());
        property.setPostalCode(postPropertyRequest.getPostalCode());
        return clientRepository.findById(postPropertyRequest.getClientId())
            .map(client -> {
                property.setClient(client);
                Property savedProperty = propertyRepository.save(property);
                return ResponseEntity.ok(savedProperty);
            })
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Client not found"
        ));
    }

    @DeleteMapping("/{propertyId}")
    @Tag(name = "properties")
    @Operation(summary = "Deactivate a property", description = "Sets property active status to false (soft delete)")
    public ResponseEntity<Property> deactivateProperty(@PathVariable Long propertyId) {
        return propertyRepository.findById(propertyId)
            .map(property -> {
                property.setActive(false);
                Property savedProperty = propertyRepository.save(property);
                return ResponseEntity.ok(savedProperty);
            })
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Property not found"
            ));
    }

    @PutMapping("/{propertyId}")
    @Tag(name = "properties")
    @Operation(summary = "Update property details", description = "Update address and postal code for a property")
    public ResponseEntity<Property> updateProperty(
            @PathVariable Long propertyId,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String postalCode) {
        
        return propertyRepository.findById(propertyId)
            .map(property -> {
                if (address != null && !address.trim().isEmpty()) {
                    property.setAddress(address);
                }
                if (postalCode != null && !postalCode.trim().isEmpty()) {
                    property.setPostalCode(postalCode);
                }
                Property updatedProperty = propertyRepository.save(property);
                return ResponseEntity.ok(updatedProperty);
            })
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Property not found"
            ));
    }
}
