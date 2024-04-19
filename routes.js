const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const db = require('./db');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, generateToken } = require('./authMiddleware');

let users = [];

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Check if user already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Save the new user
    const newUser = { id: uuidv4(), username, password: hashedPassword }; // Generate a unique UUID for each user
    users.push(newUser);
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.toString() });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
      // User authentication successful
      const token = generateToken(user.id);
      res.status(200).json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.toString() });
  }
});


// POST /api/restaurants - Add a new restaurant
router.post('/api/restaurants', authenticateToken,[
    body('restaurant_id').notEmpty(),
    body('name').notEmpty(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const createdRestaurant = await db.addNewRestaurant(req.body);
      res.status(201).json(createdRestaurant);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });

// GET /api/restaurants - Get all restaurants with optional pagination and borough filtering
router.get('/api/restaurants', [
  query('page').not().isEmpty().withMessage('Page is required').isNumeric().withMessage('Page must be a number'),
  query('perPage').not().isEmpty().withMessage('Per page is required').isNumeric().withMessage('Per page must be a number'),
  query('borough').optional().isString(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { page, perPage, borough } = req.query;
  try {
    const restaurants = await db.getAllRestaurants(parseInt(page), parseInt(perPage), borough);
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET route to display the form
router.get('/api/restaurants/form', (req, res) => {
  res.render('searchRestaurants',{layout: false});
});

// POST route to handle form submission and display results
router.post('/api/restaurants/form', async (req, res) => {
  // Extract search parameters from query string
  const { name, cuisine, borough, page, perPage } = req.body;
  
  // Create a query object that will be passed to the database
  let query = {};
  if (name) {
    query.name = { $regex: name, $options: 'i' }; // Case-insensitive regex search
  }
  if (cuisine) {
    query.cuisine = { $regex: cuisine, $options: 'i' };
  }
  if (borough) {
    query.borough = borough; // Exact match
  }

  try {
    // Apply query to database search
    const restaurants = await db.getAllRestaurants(parseInt(page), parseInt(perPage), query);
    res.render('searchRestaurants', { 
      layout: false,
      restaurants: restaurants 
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});



// GET /api/restaurants/:id - Get a single restaurant by ID
router.get('/api/restaurants/:id', [
  param('id').isMongoId(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const restaurant = await db.getRestaurantById(req.params.id);
    if (restaurant) {
      res.status(200).json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// PUT /api/restaurants/:id - Update a restaurant by ID
router.put('/api/restaurants/:id', authenticateToken, [
  param('id').isMongoId(),
  // Add validations for the update body as necessary
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedRestaurant = await db.updateRestaurantById(req.params.id, req.body);
    res.status(200).json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// DELETE /api/restaurants/:id - Delete a restaurant by ID
router.delete('/api/restaurants/:id', authenticateToken, [
  param('id').isMongoId(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await db.deleteRestaurantById(req.params.id);
    res.status(200).json({ message: 'Restaurant successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

  module.exports = router;