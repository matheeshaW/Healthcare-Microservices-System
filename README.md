## Healthcare Microservices System

This repository contains a Node.js microservices setup for a healthcare system. The patient service, doctor service, and API gateway are currently implemented and connected.

### Services (current)

- api-gateway: reverse proxy + JWT check at gateway level.
- patient-service: auth, patient profile, admin user listing, medical report upload/list.
- appointment-service: scaffold only.
- doctor-service: doctor profiles & verification, availability slot scheduling, prescription management, doctor search by specialization, soft delete support.
- notification-service: scaffold only.
- payment-service: scaffold only.
- telemedicine-service: scaffold only.
- frontend: React + Vite + Tailwind.
- k8s: placeholder for Kubernetes manifests.

### Prerequisites

- Node.js >=20.19.0 (npm >=9.0.0)
- MongoDB (Atlas or local)
- Cloudinary account (for medical report uploads)

### Environment variables

api-gateway/.env

```
PORT=5000
JWT_SECRET=supersecretkey
PATIENT_SERVICE_URL=http://localhost:5001
APPOINTMENT_SERVICE_URL=http://localhost:5003
TELEMEDICINE_SERVICE_URL=http://localhost:5006
PAYMENT_SERVICE_URL=http://localhost:5005
```

patient-service/.env

```
PORT=5001
MONGO_URI=your_mongodb_connection
JWT_SECRET=supersecretkey
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

doctor-service/.env

```
PORT=5002
MONGO_URI=your_mongodb_connection
JWT_SECRET=supersecretkey
PATIENT_SERVICE_URL=http://localhost:5001
```

telemedicine-service/.env

```
PORT=5006
RABBITMQ_URL=amqp://localhost
MONGO_URI=your_mongodb_connection
JITSI_BASE_URL=https://meet.jit.si
```

payment-service/.env

```
PORT=5005
RABBITMQ_URL=amqp://localhost
MONGO_URI=your_mongodb_connection
```

Notes:

- JWT secrets must match between gateway and patient-service.
- The MongoDB database name is the URI segment before `?`.
- Report upload depends on valid Cloudinary credentials.

### Install dependencies

```
cd api-gateway
npm install

cd ../patient-service
npm install

cd ../doctor-service
npm install

cd ../frontend
npm install
```

### Run services locally

Terminal 1 (patient-service)

```
cd patient-service
npm run dev
```

Terminal 2 (api-gateway)

```
cd api-gateway
node server.js
```

Terminal 3 (doctor-service)

```
cd doctor-service
npm run dev
```

Terminal 4 (frontend)

```
cd frontend
npm run dev
```

## API Reference

### Base URLs

- API Gateway: `http://localhost:5000`
- Patient Service direct: `http://localhost:5001`
- Doctor Service direct: `http://localhost:5002`

Yes, the exposed endpoint paths are the same through all services; only the host/port changes.

Example:

- Gateway login: `POST http://localhost:5000/api/auth/login`
- Patient Service login: `POST http://localhost:5001/api/auth/login`
- Doctor Service doctors endpoint: `POST http://localhost:5002/api/doctors`

### Authentication header format

Use this header for protected endpoints:

```
Authorization: Bearer <jwt_token>
```

### Route summary

Public:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /health` (health check - no auth required)

Protected (patient role):

- `GET /api/patient/profile`
- `POST /api/patient/profile`
- `GET /api/reports`
- `POST /api/reports/upload` (multipart form-data)
- `GET /api/doctors/search` (search available doctors)
- `GET /api/availability/doctor/:doctorId` (view doctor availability)
- `GET /api/prescriptions/patient/:patientId` (view patient prescriptions)

Protected (doctor role):

- `POST /api/doctors` (create doctor profile)
- `GET /api/doctors/me` (get own profile)
- `GET /api/doctors/:id` (view doctor profile)
- `PUT /api/doctors/:id` (update own profile)
- `POST /api/availability` (create availability slots)
- `GET /api/availability/me` (get own availability)
- `PUT /api/availability/:id` (update availability)
- `GET /api/prescriptions/me` (get own prescriptions)
- `POST /api/prescriptions` (issue prescription)
- `PUT /api/prescriptions/:id` (edit prescription)
- `PUT /api/prescriptions/:id/status` (update prescription status)

Protected (admin role):

- `GET /api/admin/users` (list all users)
- `GET /api/doctors/all` (list all doctors)
- `PUT /api/doctors/:id/verify` (verify doctor profile)

## Detailed Endpoints (Request/Response)

### 1) Register user

Endpoint:
`POST /api/auth/register`

Request body (JSON):

```json
{
  "name": "patient02",
  "email": "patient2@health.com",
  "password": "336699vv"
}
```

Success response example:

```json
{
  "success": true,
  "user": {
    "_id": "69c2c7333e71f94bcc176751",
    "name": "patient02",
    "email": "patient2@health.com",
    "password": "$2b$10$...hashed...",
    "role": "patient",
    "createdAt": "2026-04-11T10:00:00.000Z",
    "__v": 0
  }
}
```

Error response example:

```json
{
  "error": "E11000 duplicate key error collection: ... dup key: { email: \"patient2@health.com\" }"
}
```

### 2) Login user

Endpoint:
`POST /api/auth/login`

Request body (JSON):

```json
{
  "email": "patient2@health.com",
  "password": "336699vv"
}
```

Success response example:

```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "_id": "69c2c7333e71f94bcc176751",
    "name": "patient02",
    "email": "patient2@health.com",
    "password": "$2b$10$...hashed...",
    "role": "patient",
    "createdAt": "2026-04-11T10:00:00.000Z",
    "__v": 0
  }
}
```

Error response examples:

```json
{
  "message": "User not found"
}
```

```json
{
  "message": "Invalid credentials"
}
```

### 3) Create or update patient profile

Endpoint:
`POST /api/patient/profile`

Headers:

```
Authorization: Bearer <patient_jwt>
Content-Type: application/json
```

Request body (JSON):

```json
{
  "age": 26,
  "gender": "female",
  "address": "Colombo",
  "medicalHistory": ["asthma"],
  "allergies": ["penicillin"]
}
```

Success response example:

```json
{
  "success": true,
  "data": {
    "_id": "69d9f0a44b7f7f18a73e9abc",
    "userId": "69c2c7333e71f94bcc176751",
    "age": 26,
    "gender": "female",
    "address": "Colombo",
    "medicalHistory": ["asthma"],
    "allergies": ["penicillin"],
    "createdAt": "2026-04-11T10:05:00.000Z",
    "updatedAt": "2026-04-11T10:05:00.000Z"
  }
}
```

Error response examples:

```json
{
  "message": "No token"
}
```

```json
{
  "message": "No token provided"
}
```

```json
{
  "message": "Invalid token"
}
```

```json
{
  "message": "Access denied: insufficient permissions"
}
```

### 4) Get patient profile

Endpoint:
`GET /api/patient/profile`

Headers:

```
Authorization: Bearer <patient_jwt>
```

Success response example:

```json
{
  "success": true,
  "data": {
    "_id": "69d9f0a44b7f7f18a73e9abc",
    "userId": "69c2c7333e71f94bcc176751",
    "age": 26,
    "gender": "female",
    "address": "Colombo",
    "medicalHistory": ["asthma"],
    "allergies": ["penicillin"],
    "createdAt": "2026-04-11T10:05:00.000Z",
    "updatedAt": "2026-04-11T10:05:00.000Z"
  }
}
```

Not found example:

```json
{
  "message": "Profile not found"
}
```

### 5) Get all users (admin)

Endpoint:
`GET /api/admin/users`

Headers:

```
Authorization: Bearer <admin_jwt>
```

Success response example:

```json
{
  "success": true,
  "data": [
    {
      "_id": "69c2c7333e71f94bcc176751",
      "name": "patient02",
      "email": "patient2@health.com",
      "password": "$2b$10$...hashed...",
      "role": "patient",
      "createdAt": "2026-04-11T10:00:00.000Z",
      "__v": 0
    }
  ]
}
```

Forbidden example:

```json
{
  "message": "Access denied: insufficient permissions"
}
```

### 6) Upload medical report (patient)

Endpoint:
`POST /api/reports/upload`

Headers:

```
Authorization: Bearer <patient_jwt>
Content-Type: multipart/form-data
```

Request body (form-data):

- key: `file`
- value: choose a file (jpg, jpeg, png, pdf)

Success response example:

```json
{
  "success": true,
  "data": {
    "patientId": "69c2c7333e71f94bcc176751",
    "fileUrl": "https://res.cloudinary.com/.../medical_reports/abc123.pdf",
    "publicId": "medical_reports/abc123",
    "originalName": "report.pdf",
    "_id": "69da0a9a42139d1589ba3b3e",
    "createdAt": "2026-04-11T10:10:00.000Z",
    "updatedAt": "2026-04-11T10:10:00.000Z"
  }
}
```

Error response example:

```json
{
  "error": "Cannot read properties of undefined (reading 'path')"
}
```

This can occur when `file` was not sent in form-data.

### 7) Get current patient's reports

Endpoint:
`GET /api/reports`

Headers:

```
Authorization: Bearer <patient_jwt>
```

Success response example:

```json
{
  "success": true,
  "data": [
    {
      "_id": "69da0942dde1888a2d5781e3",
      "patientId": "69c2c7333e71f94bcc176751",
      "fileUrl": "https://res.cloudinary.com/.../medical_reports/sgmf9ej66iitdfvz4xll.pdf",
      "publicId": "medical_reports/sgmf9ej66iitdfvz4xll",
      "originalName": "Sample-filled-in-MR.pdf",
      "createdAt": "2026-04-11T08:41:38.852Z",
      "updatedAt": "2026-04-11T08:41:38.852Z"
    }
  ]
}
```

### 8) Create Telemedicine Session (Doctor/Patient)

Endpoint:
`POST /api/telemedicine/create`

Headers:

```
Authorization: Bearer <jwt>
```

Request body (JSON):

```json
{
  "appointmentId": "APP123",
  "doctorId": "DOC456",
  "patientId": "PAT789",
  "startTime": "2026-04-15T10:00:00Z"
}
```

Success response example:

```json
{
  "success": true,
  "data": {
    "meetingLink": "https://meet.jit.si/Healthcare_App_uniqueID",
    "appointmentId": "APP123",
    "status": "active"
  }
}
```

Error response examples:

```json
{
  "message": "Missing required IDs"
}
```

```json
{
  "message": "Invalid startTime format"
}
```

### 9) Get Meeting Link

Endpoint:
`GET /api/telemedicine/session/:appointmentId`

Headers:

```
Authorization: Bearer <jwt>
```

Success response example:

```json
{
  "success": true,
  "data": {
    "meetingLink": "https://meet.jit.si/Healthcare_App_uniqueID"
  }
}
```

### 10) Process Payment

Endpoint:
`POST /api/payment/process`

Headers:

```
Authorization: Bearer <jwt>
```

Request body (JSON):

```json
{
  "appointmentId": "APP123",
  "amount": 2500,
  "method": "card"
}
```

Success response example:

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "_id": "69f2e3a12b8c8c18a93e1def",
    "appointmentId": "APP123",
    "patientId": "69c2c7333e71f94bcc176751",
    "amount": 2500,
    "method": "card",
    "status": "success",
    "transactionId": "TXN_77889900",
    "createdAt": "2026-04-14T10:15:00.000Z"
  }
}
```

Error response examples:

```json
{
  "message": "Missing required payment details"
}
```

```json
{
  "message": "Invalid payment amount"
}
```

```json
{
  "message": "Insufficient funds or card declined"
}
```

### 11) Create Doctor Profile

Endpoint:
`POST /api/doctors`

Headers:

```
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request body (JSON):

```json
{
  "name": "Dr. Rajesh Kumar",
  "specialization": "Cardiology",
  "experience": 12,
  "hospital": "Apollo Hospital",
  "licenseNumber": "LIC123456",
  "phoneNumber": "+94771234567"
}
```

Success response example:

```json
{
  "success": true,
  "message": "Doctor profile created successfully. Awaiting admin verification."
}
```

Error response examples:

```json
{
  "success": false,
  "message": "Doctor with this license number already exists"
}
```

### 12) Get My Doctor Profile

Endpoint:
`GET /api/doctors/me`

Headers:

```
Authorization: Bearer <doctor_jwt>
```

Success response example:

```json
{
  "success": true,
  "data": {
    "_id": "69f3e2b1c4d9e5f8a2g1h3j4",
    "userId": "69c2c7333e71f94bcc176751",
    "name": "Dr. Rajesh Kumar",
    "specialization": "Cardiology",
    "experience": 12,
    "hospital": "Apollo Hospital",
    "licenseNumber": "LIC123456",
    "phoneNumber": "+94771234567",
    "verified": true,
    "rating": 4.5,
    "totalReviews": 24,
    "isActive": true,
    "createdAt": "2026-04-12T10:00:00.000Z",
    "updatedAt": "2026-04-12T10:00:00.000Z"
  },
  "message": "Your profile retrieved successfully."
}
```

Not found (404):

```json
{
  "success": false,
  "message": "Doctor profile not found. Please create your profile."
}
```

### 13) Get Doctor Profile by ID

Endpoint:
`GET /api/doctors/:id`

Headers:

```
Authorization: Bearer <jwt>
```

Success response example:

```json
{
  "success": true,
  "data": {
    "_id": "69f3e2b1c4d9e5f8a2g1h3j4",
    "userId": "69c2c7333e71f94bcc176751",
    "name": "Dr. Rajesh Kumar",
    "specialization": "Cardiology",
    "experience": 12,
    "hospital": "Apollo Hospital",
    "licenseNumber": "LIC123456",
    "phoneNumber": "+94771234567",
    "verified": true,
    "rating": 4.5,
    "totalReviews": 24,
    "isActive": true,
    "createdAt": "2026-04-12T10:00:00.000Z",
    "updatedAt": "2026-04-12T10:00:00.000Z"
  },
  "message": "Doctor profile retrieved successfully."
}
```

### 14) Search Doctors by Specialization

Endpoint:
`GET /api/doctors/search?specialization=Cardiology&verified=true`

Headers:

```
Authorization: Bearer <jwt>
```

Success response example:

```json
{
  "success": true,
  "data": [
    {
      "_id": "69f3e2b1c4d9e5f8a2g1h3j4",
      "name": "Dr. Rajesh Kumar",
      "specialization": "Cardiology",
      "experience": 12,
      "hospital": "Apollo Hospital",
      "verified": true,
      "rating": 4.5,
      "totalReviews": 24,
      "isActive": true,
      "createdAt": "2026-04-12T10:00:00.000Z",
      "updatedAt": "2026-04-12T10:00:00.000Z"
    }
  ],
  "count": 1,
  "message": "Doctors retrieved successfully."
}
```

### 15) Update Doctor Profile

Endpoint:
`PUT /api/doctors/:id`

Headers:

```
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request body (JSON):

```json
{
  "name": "Dr. Rajesh Kumar (Updated)",
  "experience": 13,
  "hospital": "New Apollo Hospital",
  "phoneNumber": "+94771234568"
}
```

Success response example:

```json
{
  "success": true,
  "data": {
    "_id": "69f3e2b1c4d9e5f8a2g1h3j4",
    "name": "Dr. Rajesh Kumar (Updated)",
    "experience": 13,
    "hospital": "New Apollo Hospital",
    "phoneNumber": "+94771234568",
    "verified": true,
    "isActive": true,
    "createdAt": "2026-04-12T10:00:00.000Z",
    "updatedAt": "2026-04-12T15:30:00.000Z"
  },
  "message": "Doctor profile updated successfully."
}
```

Error response examples:

```json
{
  "success": false,
  "message": "Unauthorized. You can only update your own profile."
}
```

### 16) Verify Doctor (Admin Only)

Endpoint:
`PUT /api/doctors/:id/verify`

Headers:

```
Authorization: Bearer <admin_jwt>
Content-Type: application/json
```

Success response example:

```json
{
  "success": true,
  "data": {
    "_id": "69f3e2b1c4d9e5f8a2g1h3j4",
    "name": "Dr. Rajesh Kumar",
    "verified": true,
    "isActive": true
  },
  "message": "Doctor verified successfully."
}
```

Forbidden (403):

```json
{
  "success": false,
  "message": "Admin access required."
}
```

### 17) Get All Doctors (Admin Only)

Endpoint:
`GET /api/doctors/all?includeDeleted=false`

Headers:

```
Authorization: Bearer <admin_jwt>
```

Query Parameters:

- `includeDeleted` (optional): `true` to include soft-deleted doctors, default is `false`

Success response example:

```json
{
  "success": true,
  "data": [
    {
      "_id": "69f3e2b1c4d9e5f8a2g1h3j4",
      "name": "Dr. Rajesh Kumar",
      "specialization": "Cardiology",
      "experience": 12,
      "verified": true,
      "isActive": true,
      "createdAt": "2026-04-12T10:00:00.000Z"
    }
  ],
  "count": 1,
  "message": "All doctors retrieved successfully."
}
```

### 18) Delete Doctor Profile (Soft Delete)

Endpoint:
`DELETE /api/doctors/:id`

Headers:

```
Authorization: Bearer <jwt>
```

Success response (200):

```json
{
  "success": true,
  "message": "Doctor profile soft deleted successfully."
}
```

### 19) Create Availability Slots

Endpoint:
`POST /api/availability`

Headers:

```
Authorization: Bearer <doctor_jwt>
Content-Type: application/json
```

Request body (JSON):

```json
{
  "date": "2026-04-15",
  "slots": [
    { "time": "09:00 AM - 09:30 AM" },
    { "time": "09:30 AM - 10:00 AM" },
    { "time": "10:00 AM - 10:30 AM" },
    { "time": "02:00 PM - 02:30 PM" }
  ]
}
```

Success response (201):

```json
{
  "success": true,
  "data": {
    "_id": "69f3e3c2d5e9f1g4h6j8k2m5",
    "doctorId": "69f3e2b1c4d9e5f8a2g1h3j4",
    "date": "2026-04-15T00:00:00.000Z",
    "slots": [
      {
        "time": "09:00 AM - 09:30 AM",
        "isBooked": false,
        "appointmentId": null,
        "_id": "69f3e3c2d5e9f1g4h6j8k2m6"
      },
      {
        "time": "09:30 AM - 10:00 AM",
        "isBooked": false,
        "appointmentId": null,
        "_id": "69f3e3c2d5e9f1g4h6j8k2m7"
      }
    ],
    "createdAt": "2026-04-12T11:00:00.000Z",
    "updatedAt": "2026-04-12T11:00:00.000Z"
  },
  "message": "Availability created with 4 slots"
}
```

Error response (400):

```json
{
  "success": false,
  "message": "Availability already exists for this date."
}
```

### 20) Get My Availability

Endpoint:
`GET /api/availability/me?fromDate=2026-04-15&toDate=2026-04-20`

Headers:

```
Authorization: Bearer <doctor_jwt>
```

Query Parameters:

- `fromDate` (optional): Filter from this date (YYYY-MM-DD format)
- `toDate` (optional): Filter till this date (YYYY-MM-DD format)

Success response (200):

```json
{
  "success": true,
  "data": [
    {
      "_id": "69f3e3c2d5e9f1g4h6j8k2m5",
      "doctorId": "69f3e2b1c4d9e5f8a2g1h3j4",
      "date": "2026-04-15T00:00:00.000Z",
      "slots": [
        {
          "time": "09:00 AM - 09:30 AM",
          "isBooked": false,
          "appointmentId": null
        },
        {
          "time": "02:00 PM - 02:30 PM",
          "isBooked": true,
          "appointmentId": "APT_12345"
        }
      ],
      "createdAt": "2026-04-12T11:00:00.000Z",
      "updatedAt": "2026-04-12T11:00:00.000Z"
    }
  ],
  "count": 1,
  "message": "Your availability retrieved successfully."
}
```

### 21) Get Doctor Availability by ID

Endpoint:
`GET /api/availability/doctor/:doctorId?fromDate=2026-04-15&toDate=2026-04-20`

Headers:

```
Authorization: Bearer <jwt>
```

Query Parameters:

- `doctorId`: The doctor's ID from the Doctor profile
- `fromDate` (optional): Filter from this date
- `toDate` (optional): Filter till this date

Success response (200):

```json
{
  "success": true,
  "data": [
    {
      "_id": "69f3e3c2d5e9f1g4h6j8k2m5",
      "doctorId": "69f3e2b1c4d9e5f8a2g1h3j4",
      "date": "2026-04-15T00:00:00.000Z",
      "slots": [
        {
          "time": "09:00 AM - 09:30 AM",
          "isBooked": false,
          "appointmentId": null
        }
      ],
      "createdAt": "2026-04-12T11:00:00.000Z",
      "updatedAt": "2026-04-12T11:00:00.000Z"
    }
  ],
  "count": 1,
  "message": "Availability retrieved successfully."
}
```

### 22) Update Availability Slots

Endpoint:
`PUT /api/availability/:id`

Headers:

```
Authorization: Bearer <doctor_jwt>
Content-Type: application/json
```

Request body (JSON):

```json
{
  "slots": [
    { "time": "09:00 AM - 09:30 AM" },
    { "time": "10:00 AM - 10:30 AM" }
  ]
}
```

Success response (200):

```json
{
  "success": true,
  "data": {
    "_id": "69f3e3c2d5e9f1g4h6j8k2m5",
    "doctorId": "69f3e2b1c4d9e5f8a2g1h3j4",
    "date": "2026-04-15T00:00:00.000Z",
    "slots": [
      {
        "time": "09:00 AM - 09:30 AM",
        "isBooked": false,
        "appointmentId": null
      },
      {
        "time": "10:00 AM - 10:30 AM",
        "isBooked": false,
        "appointmentId": null
      }
    ],
    "updatedAt": "2026-04-12T12:00:00.000Z"
  },
  "message": "Availability updated successfully."
}
```

### 23) Book Slot (Internal - Appointment Service)

Endpoint:
`PUT /api/availability/:id/book`

Headers:

```
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request body (JSON):

```json
{
  "slotIndex": 0,
  "appointmentId": "APT_12345"
}
```

Success response (200):

```json
{
  "success": true,
  "data": {
    "_id": "69f3e3c2d5e9f1g4h6j8k2m5",
    "slots": [
      {
        "time": "09:00 AM - 09:30 AM",
        "isBooked": true,
        "appointmentId": "APT_12345"
      }
    ]
  },
  "message": "Slot booked successfully."
}
```

### 24) Release Slot (Appointment Cancelled)

Endpoint:
`PUT /api/availability/:id/release`

Headers:

```
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request body (JSON):

```json
{
  "slotIndex": 0
}
```

Success response (200):

```json
{
  "success": true,
  "data": {
    "slots": [
      {
        "time": "09:00 AM - 09:30 AM",
        "isBooked": false,
        "appointmentId": null
      }
    ]
  },
  "message": "Slot released successfully."
}
```

### 25) Issue Prescription

Endpoint:
`POST /api/prescriptions`

Headers:

```
Authorization: Bearer <doctor_jwt>
Content-Type: application/json
```

Request body (JSON):

```json
{
  "appointmentId": "APT_12345",
  "patientId": "69c2c7333e71f94bcc176751",
  "notes": "Complete bed rest for 3 days. Follow up after 1 week.",
  "medicines": [
    {
      "name": "Paracetamol",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "7 days",
      "instructions": "Take with food"
    },
    {
      "name": "Ibuprofen",
      "dosage": "400mg",
      "frequency": "Once daily",
      "duration": "5 days",
      "instructions": "Take with milk"
    }
  ],
  "expiryDate": "2026-05-15"
}
```

Success response (201):

```json
{
  "success": true,
  "data": {
    "_id": "69f3e4d3e6f0g2h5i7j9k3m6",
    "appointmentId": "APT_12345",
    "doctorId": {
      "_id": "69f3e2b1c4d9e5f8a2g1h3j4",
      "name": "Dr. Rajesh Kumar",
      "specialization": "Cardiology",
      "hospital": "Apollo Hospital"
    },
    "patientId": "69c2c7333e71f94bcc176751",
    "notes": "Complete bed rest for 3 days. Follow up after 1 week.",
    "medicines": [
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "Twice daily",
        "duration": "7 days",
        "instructions": "Take with food"
      },
      {
        "name": "Ibuprofen",
        "dosage": "400mg",
        "frequency": "Once daily",
        "duration": "5 days",
        "instructions": "Take with milk"
      }
    ],
    "status": "issued",
    "expiryDate": "2026-05-15T00:00:00.000Z",
    "createdAt": "2026-04-12T14:00:00.000Z",
    "updatedAt": "2026-04-12T14:00:00.000Z"
  },
  "message": "Prescription issued successfully."
}
```

Error response (400):

```json
{
  "success": false,
  "message": "Prescription already issued for this appointment."
}
```

### 26) Get My Prescriptions (Doctor)

Endpoint:
`GET /api/prescriptions/me`

Headers:

```
Authorization: Bearer <doctor_jwt>
```

Success response (200):

```json
{
  "success": true,
  "data": [
    {
      "_id": "69f3e4d3e6f0g2h5i7j9k3m6",
      "appointmentId": "APT_12345",
      "doctorId": {
        "_id": "69f3e2b1c4d9e5f8a2g1h3j4",
        "name": "Dr. Rajesh Kumar",
        "specialization": "Cardiology"
      },
      "patientId": "69c2c7333e71f94bcc176751",
      "notes": "Complete bed rest for 3 days.",
      "medicines": [
        {
          "name": "Paracetamol",
          "dosage": "500mg",
          "frequency": "Twice daily",
          "duration": "7 days"
        }
      ],
      "status": "issued",
      "expiryDate": "2026-05-15T00:00:00.000Z",
      "createdAt": "2026-04-12T14:00:00.000Z"
    }
  ],
  "count": 1,
  "message": "Your prescriptions retrieved successfully."
}
```

### 27) Get Patient's Prescriptions

Endpoint:
`GET /api/prescriptions/patient/:patientId`

Headers:

```
Authorization: Bearer <jwt>
```

Success response (200):

```json
{
  "success": true,
  "data": [
    {
      "_id": "69f3e4d3e6f0g2h5i7j9k3m6",
      "appointmentId": "APT_12345",
      "doctorId": {
        "_id": "69f3e2b1c4d9e5f8a2g1h3j4",
        "name": "Dr. Rajesh Kumar",
        "specialization": "Cardiology"
      },
      "patientId": "69c2c7333e71f94bcc176751",
      "notes": "Complete bed rest for 3 days.",
      "medicines": [
        {
          "name": "Paracetamol",
          "dosage": "500mg",
          "frequency": "Twice daily",
          "duration": "7 days"
        }
      ],
      "status": "issued",
      "expiryDate": "2026-05-15T00:00:00.000Z",
      "createdAt": "2026-04-12T14:00:00.000Z"
    }
  ],
  "count": 1,
  "message": "Patient prescriptions retrieved successfully."
}
```

### 28) Get Single Prescription by ID

Endpoint:
`GET /api/prescriptions/:id`

Headers:

```
Authorization: Bearer <jwt>
```

Success response (200):

```json
{
  "success": true,
  "data": {
    "_id": "69f3e4d3e6f0g2h5i7j9k3m6",
    "appointmentId": "APT_12345",
    "doctorId": {
      "_id": "69f3e2b1c4d9e5f8a2g1h3j4",
      "name": "Dr. Rajesh Kumar",
      "specialization": "Cardiology"
    },
    "patientId": "69c2c7333e71f94bcc176751",
    "notes": "Complete bed rest for 3 days.",
    "medicines": [
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "Twice daily",
        "duration": "7 days"
      }
    ],
    "status": "issued",
    "createdAt": "2026-04-12T14:00:00.000Z"
  },
  "message": "Prescription retrieved successfully."
}
```

### 29) Update Prescription Status

Endpoint:
`PUT /api/prescriptions/:id/status`

Headers:

```
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request body (JSON):

```json
{
  "status": "filled"
}
```

Valid statuses: `issued`, `filled`, `expired`

Success response (200):

```json
{
  "success": true,
  "data": {
    "_id": "69f3e4d3e6f0g2h5i7j9k3m6",
    "appointmentId": "APT_12345",
    "status": "filled",
    "doctorId": {
      "name": "Dr. Rajesh Kumar",
      "specialization": "Cardiology"
    }
  },
  "message": "Prescription status updated successfully."
}
```

### 30) Edit Prescription

Endpoint:
`PUT /api/prescriptions/:id`

Headers:

```
Authorization: Bearer <doctor_jwt>
Content-Type: application/json
```

Request body (JSON):

```json
{
  "notes": "Updated notes: Continue medications",
  "medicines": [
    {
      "name": "Aspirin",
      "dosage": "250mg",
      "frequency": "Once daily",
      "duration": "10 days",
      "instructions": "Take in morning"
    }
  ]
}
```

Success response (200):

```json
{
  "success": true,
  "data": {
    "_id": "69f3e4d3e6f0g2h5i7j9k3m6",
    "appointmentId": "APT_12345",
    "notes": "Updated notes: Continue medications",
    "medicines": [
      {
        "name": "Aspirin",
        "dosage": "250mg",
        "frequency": "Once daily",
        "duration": "10 days"
      }
    ],
    "status": "issued"
  },
  "message": "Prescription updated successfully."
}
```

Error response (400):

```json
{
  "success": false,
  "message": "Cannot edit prescription. Status must be \"issued\"."
}
```

### 31) Health Check

Endpoint:
`GET /health` (No auth required)

Success response (200):

```json
{
  "success": true,
  "message": "Doctor service is running!",
  "timestamp": "2026-04-12T14:00:00.000Z"
}
```

## Event-Driven Architecture (RabbitMQ)

To ensure high performance and reliability, this system uses RabbitMQ for "Fire and Forget" communication:

- Trigger: When a Payment is successful, the Payment Service sends a message to the payment.success queue.

- Action: The Notification Service (which is always listening) picks up that message and sends an email receipt to the patient.

- Benefit: This keeps the app fast because the user doesn't have to wait for the email server to finish before they see their payment confirmation.

## Gateway vs Direct Service Behavior

- Response body shape for successful requests is effectively the same.
- Path names are the same.
- The difference is where JWT is checked first:
  - via gateway: gateway checks token before forwarding.
  - direct patient-service: patient-service middleware checks token.
  - direct doctor-service: doctor-service middleware checks token.
- Because of that, auth error messages can differ slightly (for example `No token` vs `No token provided`).

## Quick test flow (recommended)

1. Register: `POST /api/auth/register`
2. Login: `POST /api/auth/login` and copy token
3. Create profile: `POST /api/patient/profile` with bearer token
4. Upload report: `POST /api/reports/upload` with bearer token + form-data `file`
5. List reports: `GET /api/reports` with bearer token
6. Admin test: use admin token for `GET /api/admin/users`
7. Create doctor profile: `POST /api/doctors` with doctor bearer token
8. Admin verify doctor: `PUT /api/doctors/:id/verify` with admin token (required before doctor can create slots/prescriptions)
9. Create availability: `POST /api/availability` with verified doctor token
10. Issue prescription: `POST /api/prescriptions` with verified doctor token

## Notes

- New users default to role `patient`.
- To test admin routes, set a user role to `admin` in MongoDB and login with that user.
- Current auth register/login responses include hashed password in `user`; in production this should be omitted.
- Doctor profiles must be verified by an admin before they can create availability slots or issue prescriptions.
- Prescription default expiry is 30 days from creation date.
- Supported doctor specializations: Cardiology, Dermatology, Pediatrics, Neurology, Orthopedics, General Medicine, Dentistry.
