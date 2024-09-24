package is442g3t2.cleaner_scheduler.models;


import com.google.maps.GeocodingApi;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.LatLng;
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

    public static LatLng getCoordinatesFromPostalCode(String postalCode) {
        try {

            GeocodingResult[] results = GeocodingApi.newRequest(WorkerLocationFinder.context)
                    .region("sg")
                    .bounds(new LatLng(1.1304753, 103.6920359), new LatLng(1.4504753, 104.0920359))
                    .address(postalCode)
                    .await();

            if (results != null && results.length > 0) {
                return results[0].geometry.location;
            } else {
                throw new IllegalArgumentException("Invalid postal code for Singapore: " + postalCode);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error geocoding postal code: " + postalCode, e);
        }
    }


}
