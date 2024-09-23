package is442g3t2.cleaner_scheduler.models;

import com.google.maps.DistanceMatrixApi;
import com.google.maps.GeoApiContext;
import com.google.maps.model.DistanceMatrix;
import com.google.maps.model.LatLng;
import com.google.maps.model.TravelMode;
import is442g3t2.cleaner_scheduler.models.shift.Shift;

import java.time.*;
import java.util.*;

import static is442g3t2.cleaner_scheduler.models.Property.getCoordinatesFromPostalCode;

public class WorkerLocationFinder {
    private static final String API_KEY = System.getenv("GOOGLE_API_KEY");
    public static GeoApiContext context;

    static {
        context = new GeoApiContext.Builder().apiKey(API_KEY).build();
    }


    private static long getTravelTime(LatLng origin, LatLng destination, LocalDateTime departureTime) {
        try {
            // Convert LocalDateTime to ZonedDateTime, then to Instant
            ZonedDateTime zonedDateTime = departureTime.atZone(ZoneId.systemDefault());
            Instant instant = zonedDateTime.toInstant();

            DistanceMatrix matrix = DistanceMatrixApi.newRequest(context)
                    .origins(origin)
                    .destinations(destination)
                    .mode(TravelMode.DRIVING)
                    .departureTime(instant)
                    .await();

            return matrix.rows[0].elements[0].durationInTraffic.inSeconds;
        } catch (Exception e) {
            e.printStackTrace();
            return -1;
        }
    }

    public static boolean isWorkerAvailable(Worker worker, LocalTime targetTime) {
        for (Shift shift : worker.getShifts()) {
            if (!targetTime.isBefore(shift.getStartTime()) && !targetTime.isAfter(shift.getEndTime())) {
                return false;
            }
        }
        return true;
    }

    public static List<WorkerWithTravelTime> findTopFiveClosestWorkers(LatLng targetLocationLatLng, LocalDate targetDate, LocalTime targetStartTime, LocalTime targetEndTime, List<Worker> workers) {
        PriorityQueue<WorkerWithTravelTime> closestWorkers = new PriorityQueue<>(5, Comparator.comparingLong(WorkerWithTravelTime::getTravelTimeToTarget));
        LocalDateTime targetDateTime = LocalDateTime.of(targetDate, targetStartTime);

        for (Worker worker : workers) {
            Optional<Shift> availableShift = findAvailableShift(worker, targetDate, targetStartTime, targetEndTime);
            if (availableShift.isPresent()) {
                Shift shift = availableShift.get();
                LatLng workerLocation = getWorkerLocation(worker, shift, targetDate, targetStartTime);
                System.out.println("Worker location is " + workerLocation);
                long travelTimeToTarget = getTravelTime(workerLocation, targetLocationLatLng, targetDateTime);
                if (travelTimeToTarget > 0) {
                    if (closestWorkers.size() < 5) {
                        closestWorkers.offer(new WorkerWithTravelTime(worker, travelTimeToTarget, shift, workerLocation));
                    } else if (travelTimeToTarget < closestWorkers.peek().getTravelTimeToTarget()) {
                        closestWorkers.poll();
                        closestWorkers.offer(new WorkerWithTravelTime(worker, travelTimeToTarget, shift, workerLocation));
                    }
                }
            }
        }

        List<WorkerWithTravelTime> result = new ArrayList<>(closestWorkers);
        result.sort(Comparator.comparingLong(WorkerWithTravelTime::getTravelTimeToTarget));
        return result;
    }

    private static LatLng getWorkerLocation(Worker worker, Shift shift, LocalDate targetDate, LocalTime targetTime) {
        if (shift.getDate().equals(targetDate) && !targetTime.isBefore(shift.getStartTime())) {
            return getCoordinatesFromPostalCode(shift.getProperty().getPostalCode());
        } else {
            return getCoordinatesFromPostalCode(worker.getHomePostalCode());
        }
    }


    private static Optional<Shift> findAvailableShift(Worker worker, LocalDate targetDate, LocalTime targetStartTime, LocalTime targetEndTime) {
        return worker.getShifts().stream()
                .filter(shift -> shift.getDate().equals(targetDate))
                .filter(shift -> !hasOverlap(shift, targetStartTime, targetEndTime))
                .findFirst();
    }

    private static boolean hasOverlap(Shift shift, LocalTime startTime, LocalTime endTime) {
        return !(endTime.isBefore(shift.getStartTime()) || startTime.isAfter(shift.getEndTime()));
    }

    private static Optional<Shift> findPreviousShift(Worker worker, LocalDate targetDate, LocalTime targetStartTime) {
        return worker.getShifts().stream()
                .filter(shift -> shift.getDate().equals(targetDate) || shift.getDate().isBefore(targetDate))
                .filter(shift -> shift.getEndTime().isBefore(targetStartTime) || shift.getDate().isBefore(targetDate))
                .max(Comparator.comparing(Shift::getDate).thenComparing(Shift::getEndTime));
    }

}