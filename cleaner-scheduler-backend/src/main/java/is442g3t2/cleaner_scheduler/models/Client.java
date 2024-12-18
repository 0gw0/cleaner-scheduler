package is442g3t2.cleaner_scheduler.models;

import is442g3t2.cleaner_scheduler.models.property.Property;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;


@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String status;

    {
        this.status = "Active";
    }

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Property> properties = new ArrayList<>();

    public Client(String name) {
        this.name = name;
    }


    public void addProperty(Property property) {
        properties.add(property);
        property.setClient(this);
    }

    public void removeProperty(Property property) {
        properties.remove(property);
        property.setClient(null);
    }
}
