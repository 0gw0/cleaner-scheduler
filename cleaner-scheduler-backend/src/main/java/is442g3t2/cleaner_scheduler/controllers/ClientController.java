package is442g3t2.cleaner_scheduler.controllers;

import is442g3t2.cleaner_scheduler.models.Client;
import is442g3t2.cleaner_scheduler.repositories.ClientRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ClientController {

    private final ClientRepository clientRepository;

    public ClientController(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    @GetMapping("/clients")
    List<Client> getClients() {
        return clientRepository.findAll();
    }
}
