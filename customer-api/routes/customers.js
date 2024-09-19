const express = require('express');
const fs = require('fs');
const router = express.Router();

const customersFilePath = './customers.json';

// Helper function to read customer data
const readCustomers = () => {
  const data = fs.readFileSync(customersFilePath);
  return JSON.parse(data);
};

// 1. List customers with search and pagination
router.get('/', (req, res) => {
  const { first_name, last_name, city, page = 1, limit = 10 } = req.query;
  let customers = readCustomers();

  // Search filters
  if (first_name) customers = customers.filter(c => c.first_name.toLowerCase().includes(first_name.toLowerCase()));
  if (last_name) customers = customers.filter(c => c.last_name.toLowerCase().includes(last_name.toLowerCase()));
  if (city) customers = customers.filter(c => c.city.toLowerCase().includes(city.toLowerCase()));

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedCustomers = customers.slice(startIndex, endIndex);

  res.json({
    page: parseInt(page),
    limit: parseInt(limit),
    total: customers.length,
    customers: paginatedCustomers
  });
});

// 2. Get customer by ID
router.get('/:id', (req, res) => {
  const customers = readCustomers();
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  res.json(customer);
});

// 3. List unique cities with customer count
router.get('/unique/cities', (req, res) => {
  const customers = readCustomers();
  const cities = {};

  customers.forEach(customer => {
    if (cities[customer.city]) {
      cities[customer.city]++;
    } else {
      cities[customer.city] = 1;
    }
  });

  res.json(cities);
});

// 4. Add a new customer with validation
router.post('/', (req, res) => {
  const { first_name, last_name, city, company } = req.body;
  let customers = readCustomers();

  // Validate required fields
  if (!first_name || !last_name || !city || !company) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate city and company exist
  const validCity = customers.some(c => c.city === city);
  const validCompany = customers.some(c => c.company === company);

  if (!validCity || !validCompany) {
    return res.status(400).json({ message: 'City and Company must already exist' });
  }

  // Add new customer
  const newCustomer = {
    id: customers.length + 1, // Incremental ID
    first_name,
    last_name,
    city,
    company
  };

  customers.push(newCustomer);
  fs.writeFileSync(customersFilePath, JSON.stringify(customers, null, 2));

  res.status(201).json(newCustomer);
});

module.exports = router;
