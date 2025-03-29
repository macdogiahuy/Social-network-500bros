# Social Network Project

A full-stack social network application with microservices architecture.

## Project Structure

- `bento-microservices-express/`: Backend API with microservices
- `bento-social-next/`: Frontend Next.js application

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd bento-microservices-express/bento-microservices-express
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your configuration:
- Set database credentials (DB_USERNAME, DB_PASSWORD)
- Set Redis password
- Set JWT secret key
- Keep HOST=0.0.0.0 to allow external connections

4. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd bento-social-next/bento-social-next
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env`:
- For local development: `NEXT_PUBLIC_API_DOMAIN='http://localhost:3000'`
- For network access: `NEXT_PUBLIC_API_DOMAIN='http://YOUR_IP_ADDRESS:3000'`

4. Start the development server:
```bash
npm run dev
```

## Accessing the Application

### Local Development
- Backend API: http://localhost:3000
- Frontend: http://localhost:3001

### Network Access
1. Find your computer's IP address:
   - Windows: Run `ipconfig` in terminal
   - Mac/Linux: Run `ifconfig` in terminal

2. Configure Windows Firewall (required for external access):
   - Open PowerShell as Administrator
   - Run these commands:
   ```powershell
   netsh advfirewall firewall add rule name="Node.js Backend (TCP-In)" dir=in action=allow protocol=TCP localport=3000
   netsh advfirewall firewall add rule name="Next.js Frontend (TCP-In)" dir=in action=allow protocol=TCP localport=3001
   ```

3. Access from other devices on the same network:
   - Backend API: http://YOUR_IP_ADDRESS:3000
   - Frontend: http://YOUR_IP_ADDRESS:3001

## Troubleshooting

1. Connection Issues:
   - Verify both servers are running
   - Check firewall settings
   - Ensure devices are on the same network
   - Try disabling antivirus temporarily

2. Database Connection:
   - Verify MySQL is running
   - Check database credentials in .env
   - Ensure database exists

3. Redis Connection:
   - Verify Redis server is running
   - Check Redis password in .env