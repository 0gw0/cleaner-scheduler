package is442g3t2.cleaner_scheduler.models.worker;

import com.google.maps.DistanceMatrixApi;
import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.errors.ApiException;
import com.google.maps.model.*;

import is442g3t2.cleaner_scheduler.models.leave.AnnualLeave;
import is442g3t2.cleaner_scheduler.models.leave.MedicalLeave;
import is442g3t2.cleaner_scheduler.models.shift.Shift;
import is442g3t2.cleaner_scheduler.models.shift.TravelTime;

import java.io.IOException;
import java.time.*;
import java.util.*;

import static is442g3t2.cleaner_scheduler.models.property.Property.getCoordinatesFromPostalCode;

public class WorkerLocationFinder {
    private static final String API_KEY = System.getenv("GOOGLE_API_KEY");
    public static GeoApiContext context;

    private static void resetContext() {
        context.shutdown();
        context = new GeoApiContext.Builder().apiKey(API_KEY).build();
    }

    static {
        context = new GeoApiContext.Builder().apiKey(API_KEY).build();
    }

    public static TravelTime getTravelTime(LatLng origin, LatLng destination, LocalDateTime departureTime) {
        try {
            ZonedDateTime zonedDateTime = departureTime.atZone(ZoneId.systemDefault());
            Instant instant = zonedDateTime.toInstant();
            // Sanity check to ensure coordinates are within a reasonable range
            if (!isValidCoordinate(origin) || !isValidCoordinate(destination)) {
                System.err.println("Invalid coordinates detected. Please check your input.");
                return new TravelTime(-1, -1, -1);
            }

            DistanceMatrix matrix = DistanceMatrixApi.newRequest(context)
                    .origins(origin)
                    .destinations(destination)
                    .mode(TravelMode.DRIVING)
                    .departureTime(instant)
                    .await();

            if (matrix.rows.length > 0 && matrix.rows[0].elements.length > 0) {
                DistanceMatrixElement element = matrix.rows[0].elements[0];
                if (element.status == DistanceMatrixElementStatus.OK) {
                    long totalTravelTime = -1;
                    long travelTimeWithoutTraffic = -1;
                    long travelTimeInTraffic = -1;

                    if (element.duration != null) {
                        travelTimeWithoutTraffic = element.duration.inSeconds;
                        System.out.println("Travel time without traffic: " + element.duration.humanReadable);
                    }

                    if (element.durationInTraffic != null) {
                        travelTimeInTraffic = element.durationInTraffic.inSeconds;
                        System.out.println("Travel time with traffic: " + element.durationInTraffic.humanReadable);
                    }

                    if (travelTimeInTraffic != -1) {
                        totalTravelTime = travelTimeInTraffic;
                    } else if (travelTimeWithoutTraffic != -1) {
                        totalTravelTime = travelTimeWithoutTraffic;
                    }

                    // Sanity check to ensure travel time is within a reasonable range (e.g., max 4
                    // hours)
                    if (totalTravelTime > 4 * 60 * 60) {
                        System.err.println(
                                "Calculated travel time exceeds 4 hours. This seems unrealistic for local travel.");
                        return new TravelTime(-1, -1, -1);
                    }

                    return new TravelTime(totalTravelTime, travelTimeWithoutTraffic,
                            totalTravelTime - travelTimeWithoutTraffic);
                }
            }
            System.out.println("Unable to calculate travel time. Matrix response: " + matrix);
            return new TravelTime(-1, -1, -1);
        } catch (Exception e) {
            System.err.println("Error calculating travel time: " + e.getMessage());
            e.printStackTrace();
            return new TravelTime(-1, -1, -1);
        }
    }

    private static boolean isValidCoordinate(LatLng coord) {
        // Basic check for latitude (-90 to 90) and longitude (-180 to 180)
        return coord.lat >= -90 && coord.lat <= 90 && coord.lng >= -180 && coord.lng <= 180;
    }

    public static String getPostalCodeFromLocation(LatLng location) {
        if (location == null) {
            return "Unknown";
        }

        try {
            GeoApiContext context = new GeoApiContext.Builder()
                    .apiKey(API_KEY)
                    .build();

            GeocodingResult[] results = GeocodingApi.reverseGeocode(context, location)
                    .await();

            if (results != null && results.length > 0) {
                for (AddressComponent component : results[0].addressComponents) {
                    for (AddressComponentType type : component.types) {
                        if (type == AddressComponentType.POSTAL_CODE) {
                            return component.longName;
                        }
                    }
                }
            }

            return "No postal code found";
        } catch (ApiException | InterruptedException | IOException e) {
            System.err.println("Error in reverse geocoding: " + e.getMessage());
            e.printStackTrace();
            return "Error: " + e.getMessage();
        } finally {
            context.shutdown();
            resetContext();
        }
    }

    public static List<WorkerWithTravelTime> findTopFiveClosestWorkers(LatLng targetLocationLatLng,
            LocalDate targetDate, LocalTime targetStartTime, LocalTime targetEndTime, List<Worker> workers) {
        System.out.println("Starting search with " + workers.size() + " workers");

        PriorityQueue<WorkerWithTravelTime> closestWorkers = new PriorityQueue<>(5,
                Comparator.comparingLong(WorkerWithTravelTime::getTotalTravelTimeToTarget));
        LocalDateTime targetDateTime = LocalDateTime.of(targetDate, targetStartTime);

        for (Worker worker : workers) {
            System.out.println("\nChecking worker: " + worker.getId());

            List<AnnualLeave> annualLeaves = worker.getAnnualLeavesByYear(targetDate.getYear());
            List<MedicalLeave> medicalLeaves = worker.getMedicalLeavesByYear(targetDate.getYear());
            Optional<Shift> availableShift = findAvailableShift(worker, targetDate, targetStartTime, targetEndTime,
                    targetLocationLatLng);

            System.out.println("Available shift present: " + availableShift.isPresent());

            // check if worker on leave during shift date
            boolean isOnLeave = annualLeaves.stream().anyMatch(
                    leave -> !targetDate.isBefore(leave.getStartDate()) && !targetDate.isAfter(leave.getEndDate()));
            System.out.println("Worker is on leave: " + isOnLeave);
            boolean isOnMedicalLeave = medicalLeaves.stream().anyMatch(
                    leave -> !targetDate.isBefore(leave.getStartDate()) && !targetDate.isAfter(leave.getEndDate()));
            System.out.println("Worker is on medical leave: " + isOnMedicalLeave);

            Shift targetShift = new Shift(targetDate, targetStartTime, targetEndTime);

            if (!isOnLeave) {
                if (!isOnMedicalLeave) {
                    if (!availableShift.isPresent()) {
                        Optional<Shift> previousShift = findPreviousShift(worker, targetDate, targetStartTime);
    
                        if (isShiftBeforeTargetAndPossibleDistance(previousShift.get(), targetLocationLatLng,
                                targetDate, targetStartTime)) {
                            // If the worker can make it from the previous shift location, allow them
                            availableShift = Optional.of(new Shift(targetDate, targetStartTime, targetEndTime));
    
                        } else {
                            // If they can't make it, filter out the worker
                            System.out.println("Worker filtered out: No available shift");
                            System.out.println(previousShift);
                            System.out.println(
                                    isShiftBeforeTargetAndPossibleDistance(previousShift.get(), targetLocationLatLng,
                                            targetDate, targetStartTime));
                            continue;
                        }
                    }
                } else {
                    System.out.println("Worker filtered out: On Medical leave");
                    continue;
                }
                

                LatLng workerLocation;
                Optional<Shift> previousShift = findPreviousShift(worker, targetDate, targetStartTime);
                // System.out.println("Previous shift present: " + previousShift.isPresent());
                // System.out.println("Previous shift details: " + previousShift);

                if (previousShift.isPresent() && worker.shiftsOverlap(previousShift.get(), targetShift) && previousShift.get().getDate() == targetDate) {
                    System.out.println("Worker filtered out: Shifts overlap");
                    continue;
                }

                try {
                    // check if the fella can make it from previous location
                    if (previousShift.isPresent() &&
                            isShiftBeforeTargetAndPossibleDistance(previousShift.get(), targetLocationLatLng,
                                    targetDate,
                                    targetStartTime)) {
                        System.out.println("Worker can make it from previous location");
                        workerLocation = getPropertyLocation(previousShift.get().getProperty().getPostalCode());
                    } else {
                        System.out.println("Worker will start from home");
                        workerLocation = getCoordinatesFromPostalCode(worker.getHomePostalCode());
                    }

                    TravelTime travelTimeToTarget = getTravelTime(workerLocation, targetLocationLatLng, targetDateTime);
                    System.out.println("Travel time calculated: " + travelTimeToTarget.totalTravelTime);

                    if (travelTimeToTarget.totalTravelTime >= 0) {
                        updateClosestWorkers(closestWorkers,
                                new WorkerWithTravelTime(worker, travelTimeToTarget, availableShift.get(),
                                        workerLocation));
                        System.out.println("Worker added to closest workers queue");
                    } else {
                        System.out.println("Worker filtered out: Invalid travel time");
                    }
                } catch (Exception e) {
                    System.err.println("Error processing worker: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("Worker filtered out: On Annual leave");
            }
        }

        List<WorkerWithTravelTime> result = new ArrayList<>(closestWorkers);
        System.out.println("\nFinal number of workers found: " + result.size());
        return result;
    }

    private static void updateClosestWorkers(PriorityQueue<WorkerWithTravelTime> closestWorkers,
            WorkerWithTravelTime newWorker) {
        if (closestWorkers.size() < 5) {
            closestWorkers.offer(newWorker);
        } else if (newWorker.getTotalTravelTimeToTarget() < closestWorkers.peek().getTotalTravelTimeToTarget()) {
            closestWorkers.poll();
            closestWorkers.offer(newWorker);
        }
    }

    private static LatLng getPropertyLocation(String postalCode) {
        // Implement this method to return the location of the property
        // You might need to add latitude and longitude fields to your Property class
        return getCoordinatesFromPostalCode(postalCode);
    }

    private static LatLng getWorkerLocation(Worker worker, Shift shift, LocalDate targetDate, LocalTime targetTime) {
        if (shift.getDate().equals(targetDate) && !targetTime.isBefore(shift.getStartTime())) {
            return getCoordinatesFromPostalCode(shift.getProperty().getPostalCode());
        } else {
            return getCoordinatesFromPostalCode(worker.getHomePostalCode());
        }
    }

    // private static Optional<Shift> findAvailableShift(Worker worker, LocalDate
    // targetDate, LocalTime targetStartTime, LocalTime targetEndTime) {
    // Optional<Shift> previousShift = findPreviousShift(worker, targetDate,
    // targetStartTime);

    // if (previousShift.isEmpty() || isShiftEndedOneHourBefore(previousShift.get(),
    // targetDate, targetStartTime)) {
    // return Optional.of(new Shift(targetDate, targetStartTime, targetEndTime)); //
    // Placeholder shift
    // }

    // return Optional.empty(); // Worker is not available
    // }

    private static Optional<Shift> findAvailableShift(Worker worker, LocalDate targetDate, LocalTime targetStartTime,
            LocalTime targetEndTime, LatLng targetLocationLatLng) {
        Optional<Shift> previousShift = findPreviousShift(worker, targetDate, targetStartTime);

        // If no previous shift exists, worker is available
        if (previousShift.isEmpty() || isShiftEndedOneHourBefore(previousShift.get(),
                targetDate, targetStartTime)) {
            return Optional.of(new Shift(targetDate, targetStartTime, targetEndTime)); // Placeholder shift
        }

        return Optional.empty(); // Worker is not available
    }

    public static Optional<Shift> findPreviousShift(Worker worker, LocalDate targetDate, LocalTime targetStartTime) {
        LocalDateTime targetDateTime = LocalDateTime.of(targetDate, targetStartTime);
        return worker.getShifts().stream()
                .filter(shift -> {
                    LocalDateTime shiftEndDateTime = LocalDateTime.of(shift.getDate(), shift.getEndTime());
                    return shiftEndDateTime.isBefore(targetDateTime);
                })
                .max(Comparator.comparing(shift -> LocalDateTime.of(shift.getDate(), shift.getEndTime())));
    }

    private static boolean isShiftEndedOneHourBefore(Shift shift, LocalDate targetDate, LocalTime targetStartTime) {
        LocalDateTime shiftEndDateTime = LocalDateTime.of(shift.getDate(),
                shift.getEndTime());
        LocalDateTime targetDateTime = LocalDateTime.of(targetDate, targetStartTime);
        return shiftEndDateTime.plusHours(1).isBefore(targetDateTime) ||
                shiftEndDateTime.plusHours(1).equals(targetDateTime);
    }

    public static boolean isShiftBeforeTargetAndPossibleDistance(Shift previousShift, LatLng targetLocationLatLng,
                                                                 LocalDate targetDate, LocalTime targetStartTime) {
        LocalDateTime previousShiftEndDateTime = LocalDateTime.of(previousShift.getDate(), previousShift.getEndTime());
        LocalDateTime targetDateTime = LocalDateTime.of(targetDate, targetStartTime);

        // Check if previous shift ends within 1 hour before target time
        if (targetDateTime.isAfter(previousShiftEndDateTime) &&
                (targetDateTime.isBefore(previousShiftEndDateTime.plusHours(1)) ||
                        targetDateTime.equals(previousShiftEndDateTime.plusHours(1)))) {

            LatLng workerLocation = getPropertyLocation(previousShift.getProperty().getPostalCode());

            // Calculate travel time from previous shift location to target location
            TravelTime travelTimeToTarget = getTravelTime(workerLocation, targetLocationLatLng,
                    previousShiftEndDateTime);
            System.out.println(travelTimeToTarget.totalTravelTime);

            if (travelTimeToTarget.totalTravelTime >= 0) {
                // Calculate the time difference between target start time and previous shift
                // end time in seconds
                long timeDifferenceInSeconds = java.time.Duration.between(previousShiftEndDateTime, targetDateTime)
                        .getSeconds();

                // Check if travel time is less than available time
                System.out.println("Total Travel Time (seconds): " + travelTimeToTarget.totalTravelTime);
                System.out.println("Time Difference (seconds): " + timeDifferenceInSeconds);
                System.out.println(
                        "Can worker make it? " + (travelTimeToTarget.totalTravelTime <= timeDifferenceInSeconds));
                return travelTimeToTarget.totalTravelTime <= timeDifferenceInSeconds;
            }
        }

        return false;
    }

}