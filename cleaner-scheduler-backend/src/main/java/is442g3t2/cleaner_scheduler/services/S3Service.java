package is442g3t2.cleaner_scheduler.services;

import com.amazonaws.HttpMethod;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URL;
import java.util.Date;


@Service
public class S3Service {
    private static final String BUCKET_NAME = "is442arrivals";
    private final AmazonS3 s3Client;

    public S3Service(
            @Value("${aws.accessKeyId}") String accessKey,
            @Value("${aws.secretKey}") String secretKey
    ) {

        BasicAWSCredentials awsCreds = new BasicAWSCredentials(accessKey, secretKey);

        this.s3Client = AmazonS3ClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(awsCreds))
                .withRegion(Regions.AP_SOUTHEAST_1)
                .build();

    }

    public void saveToS3(String s3Key, InputStream inputStream, String contentType) {
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(contentType);

        PutObjectRequest putObjectRequest = new PutObjectRequest(BUCKET_NAME, s3Key, inputStream, metadata);
        s3Client.putObject(putObjectRequest);
    }

    public URL getPresignedUrl(String s3Key, long expirationInSeconds) {
        Date expiration = new Date();
        long expTimeMillis = expiration.getTime() + expirationInSeconds * 1000;
        expiration.setTime(expTimeMillis);

        return s3Client.generatePresignedUrl(BUCKET_NAME, s3Key, expiration, HttpMethod.GET);
    }
}