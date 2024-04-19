require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const restaurantRoutes = require('./routes'); // Update the path to your routes file
const db = require('./db');
const appConfig = require("./package.json");
const { engine } = require('express-handlebars');
const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Set up Handlebars middleware
// Set up Handlebars middleware with prototype access allowed
app.engine('.hbs', engine({
  extname: '.hbs',
  defaultLayout: false,
  handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine','.hbs');

// Use the router for restaurant routes
app.use(restaurantRoutes);

// Start the server after successful database connection
db.initialize(process.env.DB_CONNECTION_STRING)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database', error);
    process.exit(1);
  });
