package is442g3t2.cleaner_scheduler.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import is442g3t2.cleaner_scheduler.dto.client.PostClientRequest;
import is442g3t2.cleaner_scheduler.models.Client;
import is442g3t2.cleaner_scheduler.repositories.ClientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/clients")
public class ClientController {

    private final ClientRepository clientRepository;

    public ClientController(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    @Tag(name = "clients")
    @Operation(description = "GET ALL clients", summary = "GET ALL clients")
    @GetMapping("")
    public ResponseEntity<List<Client>> getClients() {
        List<Client> clients = clientRepository.findAll();
        return ResponseEntity.ok(clients);
    }

    @Tag(name = "clients")
    @Operation( description = "GET client by client id", summary = "GET client by client id")
    @GetMapping("/{id}")
    public ResponseEntity<Client> getClient(@PathVariable Long id) {
        return clientRepository.findById(id).map(client -> ResponseEntity.ok().body(client))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Client with id " + id + " not found"
                ));
    }

    @PostMapping("")
    @Operation( description = "Create client", summary = "Create client")
    public ResponseEntity<Client> createClient(@RequestBody PostClientRequest clientCreateDTO) {
        Client client = new Client(clientCreateDTO.getName());
        Client newClient = clientRepository.save(client);
        return ResponseEntity.status(HttpStatus.CREATED).body(newClient);
    }
    
    @Tag(name = "clients")
    @Operation(description = "Update client status to 'Terminated'", summary = "Update client status")
    @PatchMapping("/{id}/terminate")
    public ResponseEntity<Client> terminateClient(@PathVariable Long id) {
        return clientRepository.findById(id).map(client -> {
            client.setStatus("Terminated");
            clientRepository.save(client);
            return ResponseEntity.ok(client);
        }).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Client with id " + id + " not found"
        ));
    }


}
