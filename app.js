const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nachRoutes = require('./routes/nachRoutes');

require('dotenv').config();

const app = express();
const port = 4000; // You can change this to your desired port number

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/nach', nachRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
