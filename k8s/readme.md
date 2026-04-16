Kubernetes Deployment Guide (Docker Desktop)

This folder contains Kubernetes manifests for running the healthcare microservices project locally with Docker Desktop Kubernetes.

Files

- namespace.yaml: Creates namespace `healthcare`.
- platform.yaml: Creates ConfigMap, Secret, PVC, Deployments, and Services.

Prerequisites

- Docker Desktop installed
- Kubernetes enabled in Docker Desktop (Settings > Kubernetes)
- kubectl installed

1) Select Docker Desktop cluster context

Run from project root:

kubectl config use-context docker-desktop
kubectl cluster-info

2) Stop Docker Compose (avoid port conflicts)

docker compose down

3) Build images used by Kubernetes

docker build -t hms/patient-service:latest -f patient-service/Dockerfile patient-service
docker build -t hms/doctor-service:latest -f doctor-service/Dockerfile doctor-service
docker build -t hms/appointment-service:latest -f appointment-service/dockerfile appointment-service
docker build -t hms/payment-service:latest -f payment-service/Dockerfile payment-service
docker build -t hms/notification-service:latest -f notification-service/Dockerfile notification-service
docker build -t hms/telemedicine-service:latest -f telemedicine-service/Dockerfile telemedicine-service
docker build -t hms/api-gateway:latest -f api-gateway/dockerfile api-gateway
docker build -t hms/frontend:latest -f frontend/Dockerfile frontend

4) Apply manifests

kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/platform.yaml

5) Inject real secret values (for full feature support)

The secret in platform.yaml contains placeholders. Replace it at runtime:

kubectl -n healthcare delete secret healthcare-secrets
kubectl -n healthcare create secret generic healthcare-secrets \
	--from-literal=MONGO_ROOT_USERNAME=admin \
	--from-literal=MONGO_ROOT_PASSWORD=password \
	--from-literal=CLOUDINARY_CLOUD_NAME=<your_value> \
	--from-literal=CLOUDINARY_API_KEY=<your_value> \
	--from-literal=CLOUDINARY_API_SECRET=<your_value> \
	--from-literal=EMAIL_USER=<your_value> \
	--from-literal=EMAIL_PASS=<your_value> \
	--from-literal=STRIPE_SECRET_KEY=<your_value>

Restart services that read secrets:

kubectl rollout restart deployment -n healthcare patient-service notification-service payment-service

6) Verify deployment

kubectl get pods -n healthcare
kubectl get svc -n healthcare

7) Access locally (port-forward)

Use separate terminals:

kubectl port-forward -n healthcare svc/api-gateway 5000:5000
kubectl port-forward -n healthcare svc/frontend 5173:5173
kubectl port-forward -n healthcare svc/rabbitmq 15672:15672

Open:

- Frontend: http://localhost:5173
- Gateway API: http://localhost:5000
- RabbitMQ UI: http://localhost:15672

Daily usage (after first successful setup)

Usually you only need:

kubectl get pods -n healthcare
kubectl port-forward -n healthcare svc/api-gateway 5000:5000
kubectl port-forward -n healthcare svc/frontend 5173:5173

When code changes in one service

Rebuild image and restart that deployment only:

docker build -t hms/<service-name>:latest -f <service-path>/Dockerfile <service-path>
kubectl rollout restart deployment/<service-name> -n healthcare

Remove deployment

kubectl delete -f k8s/platform.yaml
kubectl delete -f k8s/namespace.yaml

Notes

- Keep placeholder secrets in Git; inject real values with kubectl at runtime.
- If `port-forward` fails, check if Docker Compose is still occupying ports.
- `APPOINTMENT_SERVICE_UPDATE_URL` is set for internal Kubernetes service communication.
