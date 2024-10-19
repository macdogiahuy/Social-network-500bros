const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const sequelize = require('./config/db');
const User = require('./models/User');
const userRoutes = require('./routes/user');




const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/users', userRoutes);

const Port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Welcome to the social network API');
});

sequelize.sync({ force: false }).then(() => {
    console.log('Database synced');
});

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});
