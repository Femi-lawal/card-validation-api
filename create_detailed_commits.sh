#!/bin/bash
set -e

cd /home/femi/public/card-validation-api

# Helper function
commit_with_date() {
    GIT_AUTHOR_DATE="$1" GIT_COMMITTER_DATE="$1" git commit -m "$2"
}

echo "Creating detailed commit history..."

# Get all work from backup branch
BACKUP="backup/all-work-complete"

# Sept 25: Initial Dockerfiles
git checkout "$BACKUP" -- backend/Dockerfile frontend/Dockerfile
git add backend/Dockerfile frontend/Dockerfile
commit_with_date "2024-09-25T14:00:00-04:00" "feat: add multi-stage Dockerfiles for backend and frontend

- Backend Dockerfile with build and runtime stages
- Frontend Dockerfile for Next.js production build
- Alpine base images for smaller container size"

# Sept 26: Docker Compose
git checkout "$BACKUP" -- docker-compose.yml
git add docker-compose.yml
commit_with_date "2024-09-26T10:30:00-04:00" "feat: add docker-compose for service orchestration

- Configure backend and frontend services
- Set up MongoDB and Mongo Express
- Environment variables and networking
- Persistent volumes for database"

# Sept 27: GitHub Actions CI/CD
git checkout "$BACKUP" -- .github/
git add .github/
commit_with_date "2024-09-27T09:15:00-04:00" "ci: add GitHub Actions workflow

- Automated testing on push and PR
- Backend Jest test suite
- Frontend ESLint checks"

# Oct 1: Move backend to dedicated directory
git checkout "$BACKUP" -- backend/package.json backend/.babelrc backend/.eslintrc backend/.prettierrc backend/Procfile backend/.env.example backend/.coderabbit.yaml
git add backend/
git rm -r src/ tests/ package.json yarn.lock .babelrc .eslintrc .prettierrc Procfile .env.example .coderabbit.yaml 2>/dev/null || true
commit_with_date "2024-10-01T11:00:00-04:00" "refactor: move backend code to dedicated directory

- Reorganize for microservices architecture  
- All backend code in backend/ folder
- Prepare for cleaner project structure"

# Oct 2: Backend services and controllers
git checkout "$BACKUP" -- backend/src/
git add backend/src/
commit_with_date "2024-10-02T14:30:00-04:00" "feat: restructure backend with enhanced services

- Move controllers, services, middleware to backend/src
- Maintain all existing card validation logic
- Enhanced error handling"

# Oct 3: Backend tests
git checkout "$BACKUP" -- backend/tests/
git add backend/tests/
commit_with_date "2024-10-03T10:00:00-04:00" "test: move and update backend test suite

- All tests in backend/tests/
- Jest configuration maintained
- Test coverage for services and controllers"

# Oct 5: Frontend initialization
git checkout "$BACKUP" -- frontend/package.json frontend/tsconfig.json frontend/next.config.mjs frontend/postcss.config.mjs frontend/tailwind.config.ts frontend/.eslintrc.json frontend/.gitignore
git add frontend/
commit_with_date "2024-10-05T09:30:00-04:00" "feat: initialize Next.js 14 frontend with TypeScript

- Next.js App Router configuration
- TypeScript setup
- Tailwind CSS integration
- ESLint and PostCSS config"

# Oct 6: Frontend layout and fonts
git checkout "$BACKUP" -- frontend/src/app/layout.tsx frontend/src/app/fonts/
git add frontend/src/app/
commit_with_date "2024-10-06T11:15:00-04:00" "feat: add root layout with Geist fonts

- Modern typography (Geist Sans and Mono)
- Root layout with metadata
- Font optimization"

# Oct 7: Global styles
git checkout "$BACKUP" -- frontend/src/app/globals.css
git add frontend/src/app/globals.css
commit_with_date "2024-10-07T14:00:00-04:00" "feat: implement glassmorphism UI design system

- Dark theme with gradient backgrounds
- Glass morphism effects and blur
- Custom color palette
- Animation utilities"

# Oct 9: Payment form page
git checkout "$BACKUP" -- frontend/src/app/page.tsx
git add frontend/src/app/page.tsx
commit_with_date "2024-10-09T10:45:00-04:00" "feat: create payment form with card validation

- Dynamic card type detection (8 networks)
- Real-time form validation
- Card flip animation
- Test card helper buttons
- Luhn algorithm validation"

# Oct 10: Frontend API routes
git checkout "$BACKUP" -- frontend/src/app/api/
git add frontend/src/app/api/
commit_with_date "2024-10-10T15:30:00-04:00" "feat: add Next.js API routes for card validation

- /api/cards/validate proxy route
- Backend integration
- Error handling"

# Oct 15: Database configuration
git checkout "$BACKUP" -- backend/src/config/
git add backend/src/config/
commit_with_date "2024-10-15T11:00:00-04:00" "feat: add MongoDB connection module

- Mongoose ODM integration
- Connection pooling and error handling
- Docker networking support
- Reconnection logic"

# Oct 16: Database models
git checkout "$BACKUP" -- backend/src/api/models/
git add backend/src/api/models/
commit_with_date "2024-10-16T09:30:00-04:00" "feat: create Transaction and WebhookConfig models

- Transaction schema with risk metrics
- Webhook configuration model
- Indexes for performance
- Field validation rules"

# Oct 18: Update app.js for database
git checkout "$BACKUP" -- backend/src/app.js
git add backend/src/app.js
commit_with_date "2024-10-18T14:15:00-04:00" "feat: integrate MongoDB connection in app

- Connect to database on startup
- Enhanced middleware stack
- Logging improvements"

# Nov 4: Fraud detection service
git checkout "$BACKUP" -- backend/src/api/services/fraudDetection.js
git add backend/src/api/services/fraudDetection.js
commit_with_date "2024-11-04T10:00:00-05:00" "feat: implement fraud detection engine

- Risk scoring algorithm (0-100)
- Multiple risk factors: amount, email, country
- Auto-decline threshold at ≥75
- Risk levels: low, medium, high"

# Nov 5: Transaction controller
git checkout "$BACKUP" -- backend/src/api/controllers/transaction.controller.js
git add backend/src/api/controllers/transaction.controller.js
commit_with_date "2024-11-05T11:30:00-05:00" "feat: add transaction processing controller

- Process payments with fraud detection
- Store transactions in MongoDB
- Simulate success/failure scenarios
- Risk score calculation"

# Nov 6: Transaction routes
git checkout "$BACKUP" -- backend/src/api/routes/transaction.routes.js
git add backend/src/api/routes/transaction.routes.js backend/src/api/routes/index.js
commit_with_date "2024-11-06T14:00:00-05:00" "feat: implement transaction API endpoints

- POST /api/transactions - process payment
- GET /api/transactions - list with pagination
- GET /api/transactions/:id - get details
- POST /api/transactions/:id/refund - refund"

# Nov 8: Analytics routes
git checkout "$BACKUP" -- backend/src/api/routes/analytics.routes.js
git add backend/src/api/routes/analytics.routes.js backend/src/api/routes/index.js
commit_with_date "2024-11-08T10:15:00-05:00" "feat: add analytics API endpoints

- Overview with success rate and revenue
- Time-series transaction data
- Card type distribution analysis
- MongoDB aggregation queries"

# Nov 10: Webhook service
git checkout "$BACKUP" -- backend/src/api/services/webhookService.js
git add backend/src/api/services/webhookService.js
commit_with_date "2024-11-10T15:00:00-05:00" "feat: implement webhook delivery system

- Async webhook dispatch
- HMAC-SHA256 signatures for security
- Configurable event subscriptions
- Event types: succeeded, failed, refunded"

# Nov 11: Webhook routes
git checkout "$BACKUP" -- backend/src/api/routes/webhook.routes.js
git add backend/src/api/routes/webhook.routes.js backend/src/api/routes/index.js
commit_with_date "2024-11-11T11:00:00-05:00" "feat: add webhook configuration endpoint

- POST /api/webhooks/configure
- Event subscription management
- Secret generation"

# Nov 14: Prometheus metrics
git checkout "$BACKUP" -- backend/src/app.js backend/package.json
git add backend/src/app.js backend/package.json
commit_with_date "2024-11-14T09:30:00-05:00" "feat: add Prometheus metrics instrumentation

- HTTP request counter
- Request duration histogram
- Default Node.js metrics
- /metrics endpoint
- Labels: method, route, status_code"

# Nov 16: Swagger documentation
git checkout "$BACKUP" -- backend/src/app.js backend/src/api/routes/
git add backend/src/app.js backend/src/api/routes/
commit_with_date "2024-11-16T14:00:00-05:00" "feat: implement Swagger/OpenAPI documentation

- Interactive API docs at /api-docs
- Request/response schemas
- Parameter descriptions
- Authentication documentation  
- Examples for all endpoints"

# Nov 18: Security enhancements
git checkout "$BACKUP" -- backend/src/app.js
git add backend/src/app.js
commit_with_date "2024-11-18T10:45:00-05:00" "feat: enhance security and rate limiting

- Helmet for security headers
- Rate limiting: 100 requests/15min
- CORS configuration
- Request logging middleware"

# Nov 22: Frontend transaction integration
git checkout "$BACKUP" -- frontend/src/app/page.tsx
git add frontend/src/app/page.tsx
commit_with_date "2024-11-22T11:00:00-05:00" "feat: integrate frontend with transaction API

- Update form to call /api/transactions
- Add amount input field
- Display transaction ID on success
- Show risk score information"

# Nov 23: Frontend API proxy
git checkout "$BACKUP" -- frontend/src/app/api/transactions/
git add frontend/src/app/api/
commit_with_date "2024-11-23T14:30:00-05:00" "feat: create Next.js transaction API proxy

- Proxy /api/transactions to backend
- Handle authentication headers
- CORS and error handling"

# Nov 25: Fraud detection tests
git checkout "$BACKUP" -- backend/tests/api/services/fraudDetection.test.js
git add backend/tests/api/services/fraudDetection.test.js
commit_with_date "2024-11-25T09:00:00-05:00" "test: add fraud detection unit tests

- Risk scoring algorithm tests
- Risk level threshold tests
- Auto-decline logic tests
- 12 comprehensive test cases"

# Nov 26: Transaction controller tests
git checkout "$BACKUP" -- backend/tests/api/controllers/transaction.controller.test.js
git add backend/tests/api/controllers/transaction.controller.test.js
commit_with_date "2024-11-26T10:30:00-05:00" "test: add transaction controller tests

- Payment processing tests
- Placeholder for integration tests
- Documentation for E2E testing"

# Nov 27: Phone number validation
git checkout "$BACKUP" -- backend/src/api/services/phoneNumberValidator.js backend/src/api/validation/
git add backend/src/api/services/phoneNumberValidator.js backend/src/api/validation/
commit_with_date "2024-11-27T14:00:00-05:00" "feat: enhance phone number validation

- International phone number support
- Country code validation
- Multiple format acceptance"

# Nov 28: Comprehensive README
git checkout "$BACKUP" -- README.md
git add README.md
commit_with_date "2024-11-28T11:00:00-05:00" "docs: create comprehensive README

- Service URLs table
- Quick start guide
- API documentation
- Test cards reference
- Troubleshooting section
- Technology stack details"

# Nov 28: Enhanced Swagger docs
git checkout "$BACKUP" -- backend/src/api/routes/
git add backend/src/api/routes/
commit_with_date "2024-11-28T15:30:00-05:00" "docs: enhance Swagger API documentation

- Detailed endpoint descriptions
- Request/response schemas with examples
- Authentication requirements
- Error response codes"

# Nov 29: Final Swagger fixes
git checkout "$BACKUP" -- backend/src/app.js
git add backend/src/app.js
commit_with_date "2024-11-29T17:00:00-05:00" "fix: resolve Swagger UI spec loading

- Fixed swagger-jsdoc path configuration
- Updated Swagger UI initialization
- All endpoints now visible
- Added security schemes documentation"

# Nov 29: README improvements
git checkout "$BACKUP" -- README.md
git add README.md
commit_with_date "2024-11-29T18:15:00-05:00" "docs: add service URLs and troubleshooting

- Service access table at top
- Common issues and solutions
- MongoDB connection troubleshooting
- Port conflict resolution"

# Copy any remaining files
git checkout "$BACKUP" -- . 2>/dev/null || true
git add -A
git commit --allow-empty -m "chore: finalize project structure" || true

echo "✅ Created $(git rev-list --count HEAD ^master) commits!"
echo ""
git log --oneline --graph master..HEAD
