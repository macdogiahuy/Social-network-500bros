#!/usr/bin/env bash
# =============================================================================
# start-network.sh — Ubuntu equivalent of start-network.bat
# Usage: bash startup/start-network.sh
#        (run from the project root: Social-network-500bros/)
# =============================================================================

set -euo pipefail

# 1. Setting up the Backend Services
cd ../bento-microservices-express

# ── Load secrets from .env ───────────────────────────────────────────────────
ENV_FILE="$(dirname "$0")/.env"
echo "The env file is $ENV_FILE"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: Missing secrets file at $ENV_FILE"
  echo "       Copy startup/.env.example to startup/.env and fill in your values."
  exit 1
fi
# shellcheck source=.env
set -a; source "$ENV_FILE"; set +a

# ── SECTION 1: Detect local LAN IP ───────────────────────────────────────────
# On Ubuntu, 'hostname -I' lists all interface IPs separated by spaces.
# We pick the first non-loopback (non-127.x.x.x) address.
LOCAL_IP=$(ip route get 1.1.1.1 | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1); exit}')

if [[ -z "$LOCAL_IP" ]]; then
  echo "ERROR: Could not detect a local network IP. Are you connected to a network?"
  exit 1
fi

echo "Detected local IP: $LOCAL_IP"

# # ── SECTION 2: Navigate to backend & manage Docker ───────────────────────────
# echo "Stopping any existing Docker services..."
docker compose down

# echo "Starting fresh Docker services..."
docker compose up -d


# # ── SECTION 3: Wait for MySQL to be ready ────────────────────────────────────
echo "Waiting for MySQL to be ready..."
# until docker compose exec -T mysql mysqladmin ping -h localhost -u root -p"${MYSQL_ROOT_PASSWORD}" --silent 2>/dev/null; do

  echo "  MySQL not ready yet, retrying in 2s..."
  sleep 2
done
echo "MySQL is ready!"


# ── SECTION 5: Start backend in a new terminal ────────────────────────────────
# 'gnome-terminal' is the default terminal on Ubuntu GNOME.
# Falls back to 'xterm' if gnome-terminal is unavailable (headless / SSH).
if command -v gnome-terminal &>/dev/null; then
  gnome-terminal -- bash -c "cd $(pwd) && yarn dev; exec bash" &
elif command -v xterm &>/dev/null; then
  xterm -e "cd $(pwd) && yarn dev; exec bash" &
else
  # Headless / SSH fallback: run in background with a log file
  echo "No GUI terminal found. Running backend in background (logs: backend.log)"
  yarn dev > ../backend.log 2>&1 &
  BACKEND_PID=$!
  echo "Backend PID: $BACKEND_PID"
fi

# ── SECTION 6: Navigate to frontend & write .env ─────────────────────────────
cd ../bento-social-next

cat > .env <<EOF
NEXT_PUBLIC_API_URL=http://${LOCAL_IP}:${PORT}
NEXT_PUBLIC_BASE_URL=http://${LOCAL_IP}:${PORT}
EOF
echo "Frontend .env written."

# # ── SECTION 7: Start frontend in a new terminal ───────────────────────────────
if command -v gnome-terminal &>/dev/null; then
  gnome-terminal -- bash -c "cd $(pwd) && yarn dev; exec bash" &
elif command -v xterm &>/dev/null; then
  xterm -e "cd $(pwd) && yarn dev; exec bash" &
else
  echo "No GUI terminal found. Running frontend in background (logs: frontend.log)"
  yarn dev > ../frontend.log 2>&1 &
  FRONTEND_PID=$!
  echo "Frontend PID: $FRONTEND_PID"
fi

# # ── Final summary ─────────────────────────────────────────────────────────────
echo ""
echo "========================================"
echo "  Services started in network mode!"
echo "========================================"
echo "  Backend  : http://${LOCAL_IP}:3000"
echo "  Frontend : http://${LOCAL_IP}:3001"
echo ""
echo "Note: Services are still starting up. Give them ~10-15 seconds."
echo "Press Ctrl+C to exit this summary (services keep running)."
