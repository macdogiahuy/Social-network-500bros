Setup a Social Network with Node.js, Express, Sequelize, MySQL, and React

mkdir social-network
cd social-network

npm init -y
npm install express mysql2 sequelize dotenv cors body-parser bcryptjs jsonwebtoken

/social-network
│
├── /backend
│   ├── /config         # DB configuration
│   ├── /controllers    # Business logic
│   ├── /models         # Database models using Sequelize
│   ├── /routes         # API routes
│   ├── server.js       # Entry point for the server
│
├── /frontend
│   ├── /src
│   ├── public
│   ├── package.json
│

