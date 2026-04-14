## Healthcare Microservices System

This repository contains a Node.js microservices setup for a healthcare system. The patient service and API gateway are currently implemented and connected.

### Services (current)

- api-gateway: reverse proxy + JWT check at gateway level.
- patient-service: auth, patient profile, admin user listing, medical report upload/list.
- appointment-service: scaffold only.
- doctor-service: scaffold only.
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

Terminal 3 (frontend)

```
cd frontend
npm run dev
```

## API Reference

### Base URLs

- API Gateway: `http://localhost:5000`
- Patient Service direct: `http://localhost:5001`

Yes, the exposed endpoint paths are the same through both services; only the host/port changes.

Example:
- Gateway login: `POST http://localhost:5000/api/auth/login`
- Direct login: `POST http://localhost:5001/api/auth/login`

### Authentication header format

Use this header for protected endpoints:

```
Authorization: Bearer <jwt_token>
```

### Route summary

Public:
- `POST /api/auth/register`
- `POST /api/auth/login`

Protected (patient role):
- `GET /api/patient/profile`
- `POST /api/patient/profile`
- `GET /api/reports`
- `POST /api/reports/upload` (multipart form-data)

Protected (admin role):
- `GET /api/admin/users`

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
- Because of that, auth error messages can differ slightly (for example `No token` vs `No token provided`).

## Quick test flow (recommended)

1. Register: `POST /api/auth/register`
2. Login: `POST /api/auth/login` and copy token
3. Create profile: `POST /api/patient/profile` with bearer token
4. Upload report: `POST /api/reports/upload` with bearer token + form-data `file`
5. List reports: `GET /api/reports` with bearer token
6. Admin test: use admin token for `GET /api/admin/users`

## Notes

- New users default to role `patient`.
- To test admin routes, set a user role to `admin` in MongoDB and login with that user.
- Current auth register/login responses include hashed password in `user`; in production this should be omitted.
