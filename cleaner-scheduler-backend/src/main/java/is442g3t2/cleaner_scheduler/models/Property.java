package is442g3t2.cleaner_scheduler.models;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "properties")
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String postalCode;

    public Long getClient() {
        return client.getId();
    }

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    public Property(String address, String postalCode) {
        this.address = address;
        this.postalCode = postalCode;
    }


}
