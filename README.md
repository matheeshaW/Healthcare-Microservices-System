## Healthcare Microservices System

This repository contains a set of Node.js microservices for a healthcare system. The patient service and API gateway are currently wired and working; other services are scaffolded but not yet documented.

### Services (current)

- api-gateway: reverse proxy + auth guard for downstream services.
- patient-service: auth, patient profile, admin user listing.
- appointment-service: scaffold only.
- doctor-service: scaffold only.
- notification-service: scaffold only.
- payment-service: scaffold only.
- telemedicine-service: scaffold only.
- frontend: scaffold only.
- k8s: placeholder for Kubernetes manifests.

### Prerequisites

- Node.js 18+ (or 20+ recommended)
- MongoDB (Atlas or local)

### Environment variables

api-gateway/.env

```
PORT=5000
JWT_SECRET=supersecretkey
PATIENT_SERVICE_URL=http://localhost:5001
```

patient-service/.env

```
PORT=5001
MONGO_URI=your_mongodb_connection
JWT_SECRET=supersecretkey
```

Notes:
- JWT secrets must match between gateway and patient-service.
- The MongoDB database name is the last segment in the URI (before the ?).

### Install dependencies

```
cd api-gateway
npm install

cd ../patient-service
npm install
```

### Run services (local)

Terminal 1 (patient-service)

```
cd patient-service
npx nodemon src/server.js
```

Terminal 2 (api-gateway)

```
cd api-gateway
node server.js
```

### API Gateway routes

Base URL: http://localhost:5000

Public (no auth):

- POST /api/auth/register
- POST /api/auth/login

Protected (Bearer token required):

- GET /api/patient/profile
- POST /api/patient/profile
- GET /api/admin/users

### Patient Service routes (direct)

Base URL: http://localhost:5001

- POST /api/auth/register
- POST /api/auth/login
- GET /api/patient/profile (Bearer token)
- POST /api/patient/profile (Bearer token)
- GET /api/admin/users (Bearer token, admin role)

### Request/response examples

Register

POST http://localhost:5000/api/auth/register

```
{
	"name": "patient02",
	"email": "patient2@health.com",
	"password": "336699vv"
}
```

Login

POST http://localhost:5000/api/auth/login

```
{
	"email": "patient2@health.com",
	"password": "336699vv"
}
```

Response (example)

```
{
	"success": true,
	"token": "<jwt>",
	"user": {
		"_id": "...",
		"name": "patient02",
		"email": "patient2@health.com",
		"role": "patient"
	}
}
```

Get patient profile

GET http://localhost:5000/api/patient/profile

Headers

```
Authorization: Bearer <jwt>
```

Update patient profile

POST http://localhost:5000/api/patient/profile

Headers

```
Authorization: Bearer <jwt>
```

Body

```
{
	"age": 26,
	"gender": "female",
	"address": "Colombo",
	"medicalHistory": ["asthma"],
	"allergies": ["penicillin"]
}
```

Admin: list users

GET http://localhost:5000/api/admin/users

Headers

```
Authorization: Bearer <admin-jwt>
```

Notes:
- New users default to role "patient".
- To test admin routes, create/update a user in MongoDB with role "admin" and log in to get an admin token.
