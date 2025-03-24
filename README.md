# CoinPilot

CoinPilot is a comprehensive DCA platform that supports multiple Services and provides smart investment strategies.

[Deck](https://tome.app/instruere/coinpilot-cm1x7wqfc1yrlmsl12c4nhwrh)

## Features

- **Smart DCA Strategies**: Risk-based strategies that adapt to market conditions
- **Yield Optimization**: Access high-yield pools with our Smart Pool feature
- **Real-Time Dashboard**: Track and monitor your investments in real-time
- **User-Friendly Interface**: Intuitive UI for creating and managing DCA plans

## Project Structure

The project consists of two main components:

### Backend

- Node.js with Express.js
- TypeScript for strong typing
- MongoDB for data persistence
- Supports multiple blockchain adapters (pluggable architecture)
- OpenAI integration for price analysis and risk assessment

### Frontend

- React with TypeScript
- Tailwind CSS for styling
- Wallet integrations for Aptos and other supported chains
- React Router for navigation
- Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Wallet for supported blockchains (Aptos)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/coinpilot.git
   cd coinpilot
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the backend directory using `.env.example` as a template
   - Add your blockchain private keys, MongoDB URI, and OpenAI API key

4. Build the backend:
   ```bash
   npm run build
   ```

5. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

6. Start the development servers:

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

7. Access the application at `http://localhost:5173`

## Usage

### Creating a DCA Plan

1. Connect your wallet using the "Connect Wallet" button
2. Navigate to "Create DCA Plan"
3. Enter the amount, frequency, and risk level
4. Confirm the transaction with your wallet

### Viewing Your Plans

1. Navigate to "View DCA Plans" to see all your active plans
2. Monitor execution history and performance
3. Pause, resume, or cancel plans as needed

### Smart Pool Feature

Maximize your yields by:

1. Accessing the "Smart Pool" section
2. Reviewing available strategies
3. Selecting a strategy and depositing funds
4. Monitoring your yields in real-time

## Smart DCA Strategy

CoinPilot uses a sophisticated strategy for DCA investments:

1. **Risk Assessment**: Choose from No Risk, Low Risk, Medium Risk, or High Risk levels
2. **Price Analysis**: We analyze token price trends using historical data
3. **Dynamic Adjustments**: Investment amounts are adjusted based on market conditions
4. **Optimized Execution**: Buys more when prices are down and less when prices are up

## Supported Networks

- **Aptos**: Fully supported with native token swaps
- **Mock Mode**: For testing without real transactions

## API Endpoints

### DCA Plans

```
POST /api/dca/plans - Create a new DCA plan
POST /api/dca/plans/:planId/stop - Stop a DCA plan
GET /api/dca/users/:userId/plans - Get user's plans
GET /api/dca/users/:userId/total-investment - Get user's total investment
```

### User Management

```
POST /api/users - Create or update user
GET /api/users/:address - Get user by address
GET /api/users/id/:id - Get user by ID
```

### Smart Pool (Joule)

```
GET /api/joule/pool/best - Get best Joule pool info
GET /api/joule/balance - Get user's deposit balance
POST /api/joule/lend - Lend to best Joule pool
POST /api/joule/withdraw - Withdraw from Joule pool
POST /api/joule/calculate-interest - Calculate theoretical accrued interest
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Aptos Labs SDK for their wallet adapter
- Move Agent Kit for Aptos integrations
- Joule Finance for yield optimization data
