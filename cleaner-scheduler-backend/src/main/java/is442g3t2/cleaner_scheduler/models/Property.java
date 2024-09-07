package is442g3t2.cleaner_scheduler.models;


import jakarta.persistence.*;
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
    private String id;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String postalCode;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

}
