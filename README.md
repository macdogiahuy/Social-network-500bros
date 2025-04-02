# Bento Social Network

A social networking application with microservices architecture using Next.js for frontend and Express.js for backend services.

## Project Structure

```
├── bento-microservices-express/   # Backend services
├── bento-social-next/            # Frontend application
├── sync-db/                      # Database synchronization scripts
├── start-localhost.bat           # Script to run locally
├── start-network.bat            # Script to run with network access
├── stop.bat                    # Script to stop all services
└── test-services.bat          # Script to test service connectivity
```

## Prerequisites

- Node.js and npm/pnpm
- Docker and Docker Compose
- MySQL (through Docker)
- Redis (through Docker)

## Getting Started

### Development Setup

1. Clone the repository
```bash
git clone [your-repo-url]
cd bento-social-network
```

2. Install dependencies in both frontend and backend directories
```bash
# Install backend dependencies
cd bento-microservices-express/bento-microservices-express
pnpm install

# Install frontend dependencies
cd ../../bento-social-next/bento-social-next
pnpm install
```

### Running the Application

#### Local Development
To run the application locally:
1. Double-click `start-localhost.bat`
2. Access:
   - Frontend: http://localhost:3001
   - Backend: http://localhost:3000

#### Network Access
To run the application with network access:
1. Double-click `start-network.bat`
2. Access:
   - Frontend: http://[your-ip]:3001
   - Backend: http://[your-ip]:3000

### Stopping the Application
To stop all services:
1. Double-click `stop.bat`

### Troubleshooting
If you encounter connection issues:
1. Run `test-services.bat` to check Docker service connectivity
2. Run `stop.bat` to clean up everything
3. Try starting again with the appropriate script

## Environment Files

The project uses different environment files for different deployment scenarios:

- `.env.development` - Local development configuration
- `.env.network` - Network access configuration

## Database Synchronization

The project includes scripts to synchronize the database between different computers:

### Exporting Database
To export your current database:
1. Navigate to `sync-db` directory
2. Run `export-db.bat`
3. Find the exported .sql file in `sync-db/dumps` directory

### Importing Database
To import a database on another computer:
1. Copy the exported .sql file to `sync-db/dumps` directory
2. Run `import-db.bat`
3. Follow the prompts to select and import the database file

For detailed instructions, see `sync-db/README.md`.

## Docker Services

The application relies on the following Docker services:

- MySQL (port 3307)
- Redis (port 6379)

These services are automatically managed by the start/stop scripts.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]