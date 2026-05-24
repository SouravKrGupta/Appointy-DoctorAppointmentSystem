# Appointy

Appointy is a MERN doctor appointment platform with three separate apps:

- `frontend`: patient-facing website
- `admin`: admin and doctor dashboard
- `backend`: API, MongoDB connection, auth, uploads, chat, and notifications

The current project is set up for local development first. Old deployment-specific files have been removed, and generated `dist` folders are not part of the source setup.

## Current Features

- Patient signup and login
- Admin login from environment credentials
- Doctor login from doctor records stored in MongoDB
- Doctor listing by specialty
- Appointment booking and cancellation
- Patient profile editing with local image upload
- Admin doctor creation and appointment management
- Doctor dashboard, appointment board, and profile editing
- Real-time patient-doctor chat after a booking is created
- Real-time notifications for appointment and chat activity
- Notifications removed after they are read
- Local media storage in `backend/media`
- Demo payment flow for testing
- Built-in help bot on the patient website

## Project Structure

```text
Appointy-master/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- media/
|   |-- middlewares/
|   |-- models/
|   |-- routes/
|   |-- utils/
|   |-- .env.example
|   `-- server.js
|-- frontend/
|   |-- public/
|   |-- src/
|   |-- .env.example
|   `-- vite.config.js
|-- admin/
|   |-- public/
|   |-- src/
|   |-- .env.example
|   `-- vite.config.js
`-- README.md
```

## Environment Setup

Use the example env files that already exist in the repo.

### Backend

Copy `backend/.env.example` to `backend/.env`.

Example values:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017
JWT_SECRET=replace_with_a_long_random_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password
CURRENCY=INR

# Optional in the current demo-payment setup
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Notes:

- The backend accepts either `MONGODB_URI` or `MONGO_URI`.
- If the connection string does not include a database name, the app appends `/appointy`.
- Admin login is controlled by `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the backend env file.

### Frontend

Copy `frontend/.env.example` to `frontend/.env`.

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### Admin

Copy `admin/.env.example` to `admin/.env`.

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_CURRENCY=INR
```

## Installation

Install dependencies in each app separately:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

```bash
cd admin
npm install
```

## Running Locally

Start each app in its own terminal.

### 1. Backend API

```bash
cd backend
npm run server
```

This starts the Express API and Socket.IO server on `http://localhost:4000`.

### 2. Patient Frontend

```bash
cd frontend
npm run dev
```

### 3. Admin and Doctor Dashboard

```bash
cd admin
npm run dev
```

Vite will print the local URLs for the frontend and admin apps in the terminal.

## Main Workflows

### Patient Flow

1. Browse doctors from the patient site.
2. Open a doctor profile and choose a slot.
3. Book the appointment.
4. View the booking in `My Appointments`.
5. Open `My Chats` after booking to message the doctor in real time.

### Admin Flow

1. Log in using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `backend/.env`.
2. Add doctors from the admin dashboard.
3. Review all appointments and operational stats.

### Doctor Flow

1. Log in with a doctor account created from the admin panel.
2. Review dashboard metrics and appointment queue.
3. Chat with patients from appointment-linked threads.
4. Update visit status and doctor profile details.

## Realtime Features

- Chat is enabled only after an appointment is booked.
- Each appointment gets its own private chat thread.
- Notifications are sent in real time for chat messages and appointment changes.
- When a notification is opened or marked read, it is removed from MongoDB and from the UI.

## Media and Payments

### Local Media

- Uploads are stored locally in `backend/media`.
- The backend serves them through `/media/...`.
- Cloudinary is not being used currently. In the future, we can integrate and use it if needed.


### Payments

- The current app is in demo payment mode.
- New appointments are treated as paid for testing purposes.
- Razorpay keys can stay as placeholders unless you later switch back to a live payment flow.

## Build Output

- `frontend/dist` and `admin/dist` are generated build folders.
- They are not part of the source code and can be deleted safely.
- Run `npm run build` inside `frontend` or `admin` only when you want a fresh production build.

## Useful Commands

```bash
cd frontend
npm run build
```

```bash
cd admin
npm run build
```

```bash
cd backend
npm start
```

## Notes

- There is no single root `npm install` or root `.env` for this repo.
- The old `client/server` layout no longer applies.
- Deployment config files were removed from the project.
