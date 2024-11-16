# Cleaner Scheduler

Cleaner Scheduler is a tool designed to streamline the management and scheduling of cleaning tasks. It provides an intuitive interface for task assignment, user management, and progress tracking, making it easier for administrators and workers alike to stay organized.

## 🚀 Features

- **Task Scheduling**: Easily assign and manage cleaning tasks.
- **Notifications**: Get timely reminders for upcoming tasks.
- **Task History**: Keep track of completed tasks with detailed history.
- **User Management**: Manage user roles, workers, and clients seamlessly.

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/0gw0/cleaner-scheduler.git
   ```

2. Navigate to the project directory:
   ```bash
   cd front-end
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

## 🖥️ Usage

To run the project:

### Front-end Set up

1. Create a .env file with the relevant keys in front-end folder

2. Navigate to the front-end directory:
   ```bash
   cd front-end
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Back-end Set up

Ensure that Mamp / Wamp is turned on

1. Create a .application.properties file in the cleaner-scheduler-backend/src/main/resources folder and add the necessary environment variables (e.g., API keys, database credentials) which will be uploaded to eLearn

2. Export the google maps API key in the terminal
   ```bash
   export GOOGLE_MAPS_API_KEY={YOUR_API_KEY}
   ```

3. Navigate to the back-end directory:
   ```bash
   cd cleaner-scheduler-backend
   ```

4. Run the back-end application:
   ```bash
   ./mvnw spring-boot:run
   ```


## 🔑 Development Credentials

For local testing purposes:
- Worker & Admin IDs: 1 - 3
- Root admin ID: 3
- Default password for all accounts: `password123`

## 📝 API Documentation

To view the API documentation, visit after running the back-end application:
```
http://localhost:8080/swagger-ui/index.html
```

## Email notifications and features

- To set up email notifications for shift reminders:
   - 1. Email Account Setup
      - Add your email address to the SPRING_MAIL_USERNAME variable in the application.properties file (ensure to include the email domain, e.g., @gmail.com)
   - 2. Gmail App Password
      - Add a Gmail App Password to the SPRING_MAIL_PASSWORD variable in the application.properties file.
      - To generate an App Password:
         1. Go to Google Account
         2. Navigate to Security
         3. Search "App Passwords"
         4. Create folder name for generated app passwor
         5. Generate app password

- Payroll Email Feature
   - The email address used to send payroll notifications is fixed to adrian.koh.2022@scis.smu.edu.sg. This email address is the only one currently configured to receive payroll emails.


