const express = require('express');
const bodyParser = require('body-parser');
const customerRoutes = require('./routes/customers');

const app = express();
const PORT = 3000;

// Middleware to parse incoming request bodies
app.use(bodyParser.json());

// Customer-related routes
app.use('/customers', customerRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
