# Payment Gateway Simulator

A production-grade payment gateway simulator demonstrating full-stack development, SRE practices, and payment industry knowledge.

## 🌐 Service URLs

| Service | URL | Credentials | Description |
|---------|-----|-------------|-------------|
| **Frontend** | http://localhost:3000 | N/A | Payment form interface |
| **Backend API** | http://localhost:5000 | token + client headers | RESTful APIs |
| **API Docs** | http://localhost:5000/api-docs | N/A | Swagger UI |
| **Metrics** | http://localhost:5000/metrics | N/A | Prometheus metrics |
| **Mongo Express** | http://localhost:8081 | admin / admin123 | Database UI |
| **MongoDB** | localhost:27017 | admin / admin123 | Database |

## 🚀 Quick Start

```bash
# Start all services
docker compose up --build

# Run tests
cd backend && npm test

# Access frontend
open http://localhost:3000
```

## 💳 Features

### Payment Gateway
- Transaction processing with fraud detection
- Risk scoring engine (0-100 scale)
- Analytics APIs (overview, time-series, card-types)
- Webhook system with HMAC-SHA256 signatures
- Transaction management (process, list, view, refund)

### Frontend
- Next.js 14 with TypeScript
- Glassmorphism UI design
- 8 card networks supported
- Dynamic card detection
- Card flip animation

### Backend
- Express with MongoDB
- Fraud detection engine
- Prometheus metrics
- Swagger/OpenAPI documentation
- Comprehensive test suite

### SRE & Observability
- Prometheus metrics at `/metrics`
- Swagger documentation at `/api-docs`
- Health checks
- Security headers (Helmet)
- Rate limiting

## 🧪 Test Cards

- **Visa**: 4242 4242 4242 4242
- **Mastercard**: 5555 5555 5555 4444
- **Amex**: 3782 822463 10005

## 📊 API Documentation

Full API documentation available at: http://localhost:5000/api-docs

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Infrastructure**: Docker, Docker Compose
- **Observability**: Prometheus, Swagger/OpenAPI
- **Testing**: Jest (40+ tests passing)

## ✅ Testing

```bash
cd backend
npm test
```

All tests passing with fraud detection coverage.
