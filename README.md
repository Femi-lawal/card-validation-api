# SecurePay - Premium Payment Gateway Simulator

A production-grade payment gateway simulator demonstrating enterprise-level security, full-stack development, and payment industry best practices.

## ✨ Key Features

| Category | Features |
|----------|----------|
| 🔐 **Security** | AES-256-GCM client-side encryption, 3D Secure OTP verification, Luhn algorithm validation |
| 💳 **Payment** | Multi-currency support (USD, EUR, GBP, JPY, CAD), 8+ card network detection |
| 🎨 **UI/UX** | 3D card flip animation, glassmorphism design, dark/light mode, responsive |
| 📊 **Features** | Transaction receipts, payment history, real-time validation |

---

## 📸 Visual Demonstration

### Landing Page with Security Features
The payment interface features end-to-end encryption, animated backgrounds, and a modern glassmorphism design.

![Landing Page](docs/screenshots/01-landing-page.png)

### Card Network Detection
Automatic card network detection with brand-specific styling:

| Visa | Mastercard | American Express |
|:----:|:----------:|:----------------:|
| ![Visa](docs/screenshots/02-visa-card-selected.png) | ![MC](docs/screenshots/03-mastercard-selected.png) | ![Amex](docs/screenshots/04-amex-card-selected.png) |

### 3D Secure Card Animation
The card flips to reveal the CVV field on the back:

| Card Front | Card Back (CVV) |
|:----------:|:---------------:|
| ![Front](docs/screenshots/05a-card-front.png) | ![Back](docs/screenshots/05b-card-back-cvv.png) |

### Form Completion & Validation

| Step 1: Card Number | Step 2: Details | Step 3: Complete |
|:-------------------:|:---------------:|:----------------:|
| ![Step 1](docs/screenshots/06a-card-number-entered.png) | ![Step 2](docs/screenshots/06b-expiry-cvv-entered.png) | ![Step 3](docs/screenshots/06c-form-completed.png) |

### Responsive Design

| Desktop | Tablet | Mobile |
|:-------:|:------:|:------:|
| ![Desktop](docs/screenshots/08-desktop-view.png) | ![Tablet](docs/screenshots/09-tablet-view.png) | ![Mobile](docs/screenshots/10-mobile-view.png) |

---

## 🔒 Security Features

### Client-Side Encryption
All card data is encrypted using **AES-256-GCM** before transmission:
```javascript
// Card data never leaves the browser unencrypted
const { encryptedData, iv } = await encryptCardData({
  cardNumber: "4242...",
  cvv: "123",
  expiry: "12/28"
});
```

### 3D Secure Verification
Payments over $50 trigger 3D Secure OTP verification:
- 6-digit code verification
- Countdown timer
- Secure modal overlay

### Real-Time Validation
- **Luhn Algorithm** - Validates card numbers mathematically
- **Expiry Check** - Prevents expired card submissions
- **CVV Length** - Dynamic based on card type (3 for Visa/MC, 4 for Amex)

---

## 💱 Multi-Currency Support

| Currency | Symbol | Conversion Rate |
|----------|--------|-----------------|
| USD | $ | 1.00 (base) |
| EUR | € | 0.92 |
| GBP | £ | 0.79 |
| JPY | ¥ | 149.50 |
| CAD | C$ | 1.36 |

---

## 🌐 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | SecurePay interface |
| **Backend API** | http://localhost:5000 | RESTful APIs |
| **API Docs** | http://localhost:5000/api-docs | Swagger UI |
| **Metrics** | http://localhost:5000/metrics | Prometheus |
| **Mongo Express** | http://localhost:8081 | Database UI |

## 🚀 Quick Start

```bash
# Start all services
docker compose up --build

# Access the payment gateway
open http://localhost:3000

# Run backend tests
cd backend && npm test

# Run E2E tests
cd e2e && npm test
```

## 🧪 Test Cards

| Network | Card Number | CVV |
|---------|-------------|-----|
| Visa | 4242 4242 4242 4242 | 123 |
| Mastercard | 5555 5555 5555 4444 | 123 |
| Amex | 3782 8224 6310 005 | 1234 |

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** with custom glassmorphism
- **Web Crypto API** for encryption
- **Canvas Confetti** for celebrations

### Backend
- **Express.js** with MongoDB
- **Fraud Detection Engine**
- **Prometheus Metrics**
- **Swagger/OpenAPI Documentation**

### Infrastructure
- **Docker** & Docker Compose
- **Playwright** E2E Testing (13 tests)
- **Jest** Unit Testing (40+ tests)

## ✅ Testing

### Unit Tests
```bash
cd backend
npm test
```

### E2E Tests
```bash
cd e2e
npm install
npx playwright install chromium
npx playwright test
npx playwright show-report
```

## 🚀 Recent Features (v2.0)

### Security Enhancements
- **Client-Side Encryption:** Sensitive data is encrypted using AES-256-GCM (simulated) before processing.
- **3D Secure Simulation:** Authenticate high-value transactions (>$50) with OTP verification.

![Encryption Badge](docs/screenshots/01b-encryption-badge.png)
*3D Secure OTP Modal*
![3D Secure Modal](docs/screenshots/03a-3ds-modal.png)

### UX Improvements
- **Multi-Currency Support:** Pay in USD, EUR, GBP, JPY, or CAD with real-time conversion display.
- **Transaction Receipts:** Detailed digital receipts with print functionality.
- **Theme Toggle:** Switch between Dark (Premium) and Light (Standard) modes.
- **Light Mode:**
![Light Mode](docs/screenshots/02-light-mode.png)

![Currency Switching](docs/screenshots/05-currency-eur.png)
![Transaction Receipt](docs/screenshots/03b-payment-success-receipt.png)

## 📁 Project Structure

```
card-validation-api/
├── backend/           # Express API server
│   ├── src/
│   │   ├── api/      # Routes & controllers
│   │   ├── config/   # Configuration
│   │   └── middleware/
│   └── tests/
├── frontend/          # Next.js 14 SecurePay UI
│   └── src/app/      # App router pages
├── e2e/              # Playwright E2E tests
│   ├── tests/
│   └── screenshots/
├── docs/screenshots/  # Documentation images
└── docker-compose.yml
```

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.
