const mongoose = require('mongoose');
const Restaurant = require('./model/restaurantModel');
const connectionString = process.env.DB_CONNECTION_STRING;

const db = {
    initialize: async () => {
      try {
        await mongoose.connect(connectionString);
        console.log('Connected to MongoDB');
      } catch (error) {
        console.error('Could not connect to MongoDB:', error.message);
        throw error; 
      }
    },
    addNewRestaurant: async (data) => {
        const restaurant = new Restaurant(data);
        return await restaurant.save();
      },
    getAllRestaurants: async (page, perPage, borough) => {
        let query = {};
        if (borough) {
            query.borough = borough;
        }
        const restaurants = await Restaurant.find(query)
            .sort({restaurant_id: 1})
            .skip((page-1)*perPage)
            .limit(perPage);
        return restaurants;
    },
    getRestaurantById: async (id) => {
        return await Restaurant.findById(id);
    },
    updateRestaurantById: async (id, data) => {
        return await Restaurant.findByIdAndUpdate(id, data, { new: true });
    },
    deleteRestaurantById: async (id) => {
        return await Restaurant.findByIdAndDelete(id);
    }
  };

  module.exports = db;