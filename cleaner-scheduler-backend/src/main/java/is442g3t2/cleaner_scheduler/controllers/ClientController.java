package is442g3t2.cleaner_scheduler.controllers;

import is442g3t2.cleaner_scheduler.models.Client;
import is442g3t2.cleaner_scheduler.repositories.ClientRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
public class ClientController {

    private final ClientRepository clientRepository;

    public ClientController(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    @GetMapping("/clients")
    
    public ResponseEntity<List<Client>> getClients() {
        List<Client> allClients = clientRepository.findAll();
        if(allClients.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "No clients found");
        }
        return ResponseEntity.ok().body(allClients);
    }
}
