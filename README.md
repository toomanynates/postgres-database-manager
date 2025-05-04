# PostgreSQL Database Manager

A full-stack PostgreSQL database manager built with React and Node.js that enables secure connection storage, comprehensive table management, and robust query execution. The application features responsive design for both desktop and mobile use, with a convenient setup wizard for first-time database connections.

## Features

- 🔐 Secure storage of database credentials
- 📊 Comprehensive PostgreSQL table management
- 📱 Responsive design for desktop and mobile
- 🧙‍♂️ First-time setup wizard
- 🔄 Connection testing and verification
- 📝 SQL query execution capabilities 
- 📒 Activity logging for operations
- 📋 Table data browsing with pagination

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui components
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **API**: RESTful endpoints
- **State Management**: React Query

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL database (local or remote)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/postgres-database-manager.git
   cd postgres-database-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   PGHOST=your_pg_host
   PGPORT=your_pg_port
   PGDATABASE=your_pg_database
   PGUSER=your_pg_user
   PGPASSWORD=your_pg_password
   ```
   
   Note: You can use these environment variables to connect to your own application database. The app will manage connections to other databases separately.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

### Using the Application

1. **First-time Setup**: On first launch, you'll be guided through a setup wizard to connect to your PostgreSQL database.

2. **Managing Databases**: Once connected, you can browse tables, view data, and execute queries.

3. **Editing Connections**: Navigate to Settings to modify your database connections or add new ones.

## Development

### Project Structure

```
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Application pages
│   │   ├── hooks/      # Custom React hooks
│   │   ├── context/    # React context providers
│   │   └── utils/      # Utility functions
│   └── ...
├── server/             # Backend Express server
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Data storage logic
│   ├── db.ts           # Database connection
│   └── ...
├── shared/             # Shared code between frontend/backend
│   └── schema.ts       # Database schema definitions
└── ...
```

### Running in Production

Build the application for production:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.