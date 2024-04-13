const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const db = require('./db');
const router = express.Router();

// POST /api/restaurants - Add a new restaurant
router.post('/api/restaurants', [
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
  query('page').optional().isNumeric(),
  query('perPage').optional().isNumeric(),
  query('borough').optional().isString(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { page = 1, perPage = 10, borough } = req.query;
  try {
    const restaurants = await db.getAllRestaurants(parseInt(page), parseInt(perPage), borough);
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET route to display the form
router.get('/api/restaurants', (req, res) => {
  res.render('searchRestaurants');
});

// POST route to handle form submission and display results
router.post('/api/restaurants', async (req, res) => {
  try {
      const { page, perPage, borough } = req.body;
      const restaurants = await db.getAllRestaurants(parseInt(page), parseInt(perPage), borough);
      res.render('searchRestaurants', { restaurants });
  } catch (error) {
      res.status(500).send('Internal Server Error');
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
router.put('/api/restaurants/:id', [
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
router.delete('/api/restaurants/:id', [
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