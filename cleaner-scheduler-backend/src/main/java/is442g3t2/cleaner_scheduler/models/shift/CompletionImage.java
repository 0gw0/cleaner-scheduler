package is442g3t2.cleaner_scheduler.models.shift;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Embeddable
@NoArgsConstructor
@Getter
@Setter
@AttributeOverrides({
        @AttributeOverride(name = "s3Key", column = @Column(name = "completion_s3_key")),
        @AttributeOverride(name = "uploadTime", column = @Column(name = "completion_upload_time")),
        @AttributeOverride(name = "fileName", column = @Column(name = "completion_file_name"))
})
public class CompletionImage extends Image {
    public CompletionImage(String s3Key, String fileName) {
        super(s3Key, fileName);
    }

    public CompletionImage(String s3Key, LocalDateTime uploadTime, String fileName) {
        super(s3Key, uploadTime, fileName);
    }
}