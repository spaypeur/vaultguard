# VaultGuard Backend

Enterprise-grade crypto security platform backend built with Node.js, TypeScript, and Supabase.

## Features

- **Authentication & Security**
  - JWT-based authentication with refresh tokens
  - Two-factor authentication (2FA) support
  - Hardware security module (HSM) integration ready
  - Password reset and email verification

- **Portfolio Management**
  - Multi-portfolio support
  - Cross-chain asset tracking
  - Real-time portfolio valuation
  - Asset allocation analysis

- **Threat Monitoring**
  - Real-time threat detection
  - Threat intelligence feeds
  - Security incident tracking
  - Automated threat response

- **Compliance Engine**
  - Multi-jurisdiction compliance tracking
  - KYC/AML automation
  - Tax reporting and optimization
  - Regulatory deadline management

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + 2FA
- **API**: Express.js + Socket.IO
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials and other configuration

5. Run database migrations:
```bash
# Execute the schema.sql file in your Supabase SQL editor
```

### Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Building for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/setup-2fa` - Setup two-factor authentication
- `POST /api/auth/verify-2fa` - Verify and enable 2FA
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user profile

### Portfolio Management
- `GET /api/portfolio` - Get user's portfolios
- `POST /api/portfolio` - Create new portfolio
- `GET /api/portfolio/:portfolioId` - Get portfolio by ID
- `PUT /api/portfolio/:portfolioId` - Update portfolio
- `DELETE /api/portfolio/:portfolioId` - Delete portfolio
- `GET /api/portfolio/:portfolioId/assets` - Get portfolio assets
- `POST /api/portfolio/:portfolioId/assets` - Add asset to portfolio
- `GET /api/portfolio/:portfolioId/summary` - Get portfolio summary
- `GET /api/portfolio/user/wealth` - Get user's total wealth

### Threat Monitoring
- `GET /api/threats` - Get user's threats
- `GET /api/threats/stats` - Get threat statistics
- `GET /api/threats/intelligence` - Get threat intelligence feed
- `GET /api/threats/:threatId` - Get threat by ID
- `POST /api/threats` - Create new threat (manual reporting)
- `PATCH /api/threats/:threatId/status` - Update threat status
- `POST /api/threats/simulate` - Simulate threat detection (demo)

### Compliance
- `GET /api/compliance` - Get user's compliance records
- `POST /api/compliance` - Create new compliance record
- `GET /api/compliance/:recordId` - Get compliance record by ID
- `PUT /api/compliance/:recordId` - Update compliance record
- `GET /api/compliance/summary/overview` - Get compliance summary

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - Secret for JWT token signing
- `NODE_ENV` - Environment (development/production)

## Security Features

- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Configured for secure cross-origin requests
- **Helmet**: Security headers for Express
- **Input Validation**: Joi schema validation on all inputs
- **SQL Injection Protection**: Parameterized queries via Supabase
- **XSS Protection**: Content Security Policy headers
- **Audit Logging**: All critical actions are logged

## Database Schema

The database schema includes:
- Users and authentication
- Portfolios and assets
- Threats and security incidents
- Compliance records
- Audit logs
- API keys

See `src/config/schema.sql` for the complete schema.

## Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Linting

```bash
npm run lint
npm run lint:fix
```

## Type Checking

```bash
npm run type-check
```

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── tests/              # Test files
├── docs/               # Documentation
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

Proprietary - VaultGuard Platform

## Support

For support, email support@vaultguard.com or join our Slack channel.
