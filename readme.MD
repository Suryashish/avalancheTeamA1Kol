# Avalanche Blockchain Monitoring & Explorer

A real-time blockchain monitoring and explorer application for Avalanche custom L1 networks, featuring a comprehensive Data Availability (DA) watchdog system and transaction indexer.

## Application Architecture

### Overview
This is a **real-time blockchain monitoring and explorer application** for Avalanche custom L1 networks, featuring a comprehensive Data Availability (DA) watchdog system and transaction indexer.

### Architecture Components

#### 1. **Backend Layer** (`testingRPC/index.js`)
```
Express.js Server + WebSocket Server
├── HTTP API Endpoints
├── WebSocket Real-time Communication
├── In-memory Data Storage
└── Blockchain RPC Integration
```

**Key Responsibilities:**
- **RPC Monitoring**: Multi-endpoint blockchain data fetching
- **DA Scoring Engine**: Complex algorithm scoring network health (0-100)
- **Performance Tracking**: Response times, success rates, failure counts
- **Alert System**: Threshold-based notifications (warning/critical)
- **Real-time Broadcasting**: WebSocket updates to frontend clients
- **Data Export**: JSON/CSV export functionality

**Core Modules:**
- **Sampling Engine**: Fetches blocks/transactions from multiple RPCs
- **Consistency Checker**: Compares data across different RPC endpoints
- **Performance Monitor**: Tracks RPC health and response metrics
- **Alert Manager**: Generates and manages system alerts

#### 2. **Frontend Layer** (React/TypeScript)
```
React SPA with TypeScript
├── Component Architecture
│   ├── Dashboard Components
│   ├── Indexer Components
│   └── UI Components (shadcn/ui)
├── Real-time Data Management
├── Routing (React Router)
└── State Management (React Hooks)
```

**Main Pages:**
- **Landing Page**: Entry point and navigation
- **Configuration Page**: RPC endpoint setup
- **Dashboard**: Multi-tab monitoring interface
- **Indexer Page**: Blockchain explorer functionality

**Dashboard Tabs:**
- **Overview**: Real-time DA scores, charts, block details
- **Performance**: RPC metrics, response times, health status
- **Network**: Topology visualization, endpoint details
- **Alerts**: Alert management and acknowledgment
- **Live Data**: Raw blockchain data inspection

#### 3. **Data Flow Architecture**

```
RPC Endpoints → Backend Sampling → Processing → Storage → WebSocket → Frontend
     ↓              ↓                ↓           ↓          ↓         ↓
[Multiple RPCs] → [Data Fetch] → [DA Scoring] → [Memory] → [Real-time] → [UI Updates]
```

**Data Pipeline:**
1. **Input**: Multiple RPC endpoints (configurable)
2. **Sampling**: Parallel block/transaction fetching
3. **Analysis**: Consistency checking and performance measurement
4. **Scoring**: Multi-factor DA health calculation
5. **Storage**: In-memory historical data (last 1000 samples)
6. **Broadcasting**: Real-time WebSocket updates
7. **Visualization**: Charts, tables, and metrics display

#### 4. **Scoring Algorithm Architecture**

```
DA Score (0-100) = Sum of Weighted Factors:
├── Block Consistency (25 pts)     - Cross-RPC block hash comparison
├── TX Consistency (20 pts)        - Transaction data verification
├── RPC Health (20 pts)            - Endpoint availability status
├── Response Time (15 pts)         - Performance benchmarking
├── Network Reliability (10 pts)   - Success rate tracking
├── Data Freshness (5 pts)         - Timestamp recency check
└── Error Penalty (-5 pts)         - Failure rate deduction
```

**Real-World Scoring Examples:**
- **90-100 (A+)**: Perfect network with fast responses, all RPCs healthy
- **80-89 (A)**: Excellent performance with minor latency
- **70-79 (B)**: Good performance with some consistency issues
- **60-69 (C)**: Acceptable but with notable problems
- **50-59 (D)**: Poor performance requiring attention
- **0-49 (F)**: Critical issues needing immediate action

#### 5. **Technology Stack**

**Backend:**
- **Runtime**: Node.js
- **Framework**: Express.js
- **WebSocket**: ws library
- **HTTP Client**: Axios
- **Data Storage**: In-memory arrays/objects

**Frontend:**
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Charts**: Recharts
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

**Development Tools:**
- **Language**: TypeScript
- **Linting**: ESLint
- **Package Manager**: npm/yarn

#### 6. **Communication Patterns**

**WebSocket Communication:**
```
Client ←→ Server
├── Connection Events
│   ├── initial: Historical data + alerts
│   ├── da_update: New DA score results
│   ├── alert: New system alerts
│   └── alert_acknowledged: Alert status updates
└── Client Commands
    └── acknowledge_alert: Alert acknowledgment
```

**REST API Endpoints:**
```
/api/configure      POST    - Configure RPC endpoints
/api/configuration  GET     - Get current configuration
/api/history        GET     - Historical DA data
/api/performance    GET     - Performance metrics
/api/alerts         GET     - Alert management
/api/topology       GET     - Network topology
/api/export         GET     - Data export (JSON/CSV)
/da                 GET     - Single DA score sample
```

#### 7. **State Management**

**Frontend State:**
- **Real-time Data**: Current DA results via WebSocket
- **Historical Data**: Time-series data for charts
- **Alerts**: System notifications and acknowledgments
- **Configuration**: RPC endpoints and settings
- **UI State**: Active tabs, modals, navigation

**Backend State:**
- **In-memory Storage**: Historical samples (max 1000)
- **Performance Metrics**: RPC health tracking
- **Alert Queue**: Active and acknowledged alerts
- **Network Health**: Uptime and reliability stats

#### 8. **Security & Performance Considerations**

**Performance Optimizations:**
- WebSocket for real-time updates (no polling)
- Data pagination and limits
- Memory management (bounded collections)
- Timeout handling for RPC calls

**Error Handling:**
- RPC failure tolerance
- WebSocket reconnection logic
- Graceful degradation
- Comprehensive error logging

#### 9. **Deployment Architecture**

```
Production Setup:
├── Backend Server (Node.js + Express)
│   ├── HTTP Server (Port 3001)
│   ├── WebSocket Server
│   └── RPC Monitoring Loop
└── Frontend (React SPA)
    ├── Static Build Files
    ├── Client-side Routing
    └── WebSocket Client
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd avalanche-monitoring-app
   ```

2. **Install backend dependencies**
   ```bash
   cd testingRPC
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend/client
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd testingRPC
   node index.js
   ```
   The server will start on `http://localhost:3001`

2. **Start the frontend development server**
   ```bash
   cd frontend/client
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

## Features

### Advanced Features Implemented:

**Backend Enhancements:**
✅ **Granular Scoring**: Dynamic scores from 0-100 instead of just 50/100  
✅ **Score Breakdown**: Detailed factor analysis for each component  
✅ **Performance Grades**: A+ to F letter grades (A+ = 90+, A = 80+, etc.)  
✅ **Enhanced Alerts**: Specific alerts for RPC health and latency issues  
✅ **Smart Thresholds**: Context-aware scoring based on real network conditions  

**Frontend Enhancements:**
✅ **Visual Score Breakdown**: Interactive progress bars for each factor  
✅ **Grade Display**: Letter grades with color-coded badges  
✅ **Factor Analysis**: Real-time breakdown showing what affects the score  
✅ **Enhanced Tooltips**: Detailed explanations for each scoring component  

**Core Features:**
- **Real-time Monitoring**: Live DA score updates via WebSocket
- **Multi-RPC Support**: Configure and monitor multiple RPC endpoints
- **Performance Analytics**: Response times, success rates, and health metrics
- **Alert System**: Configurable thresholds with notification management
- **Blockchain Explorer**: Transaction search and block inspection
- **Data Export**: Export monitoring data in JSON/CSV formats
- **Responsive UI**: Modern React interface with dark/light mode support

## Configuration

Configure RPC endpoints through the Configuration page in the web interface, or by modifying the default endpoints in `testingRPC/index.js`.

## Contributing

This project was developed as part of an Avalanche hackathon. Contributions are welcome!

## License

[Add your license here]