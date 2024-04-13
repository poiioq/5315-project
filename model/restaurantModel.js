// restaurantModel.js
const mongoose = require('mongoose');

// Define the schema for the grades sub-document
const gradeSchema = new mongoose.Schema({
    date: Date,
    grade: String,
    score: Number
})

// Define the schema for the address sub-document
const addressSchema = new mongoose.Schema({
    building: String,
    coord: [Number], // An array to hold coordinates (longitude, latitude)
    street: String,
    zipcode: String
  });

const restaurantSchema = new mongoose.Schema({
  address: addressSchema,
  borough: String,
  cuisine: String,
  grades: [gradeSchema],
  name: String,
  restaurant_id: String
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
