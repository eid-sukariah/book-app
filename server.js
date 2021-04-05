'use strict';
require('dotenv').config();


const express = require('express');
const superagent = require('superagent');   // Application Dependencies
const pg = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;
const DATABASE_URL= process.env.DATABASE_URL;   // Application Setup
const NODE_ENV = process.env.NODE_ENV;

const options = NODE_ENV === 'production' ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } } : { connectionString: DATABASE_URL };             //to connect with heroku

const client = new pg.Client(options);

client.on('error', err => {console.log('unable to connect database');});

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public/styles'));          // Application Middleware
app.use(errorHandler);
app.set('view engine', 'ejs');     // Set the view engine for server-side templating

// API Routes
app.get('/', renderHomePage);// Renders the home page
app.get('/searches/new', showForm);// Renders the search form
app.post('/searches', createSearch);// Creates a new search to the Google Books API

// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

client.connect().then(() => app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))); //listen when you connict with database

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }
    res.status(500);
    res.render('pages/error', { error: err });
}

// HELPER FUNCTIONS
// Only show part of this to get students started
function Book(data) {
    this.title = data.title || 'No title available';
    this.author = data.authors.join(',') || 'No author available';
    this.description = data.description || 'No description available';
    this.image = (data.imageLinks) ? data.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
}

// Note that .ejs file extension is not required
function renderHomePage(request, response) {
  const sql = 'SELECT * FROM books;';
  client.query(sql)
  .then(resulte => response.render('pages/index', {resulte: resulte.rows,counter: resulte.rowCount}))
  .catch((error) => errorHandler(error, response));
 
}
function showForm(request, response) {
  response.render('pages/searches/new.ejs');
}

// No API key required
// Console.log request.body and request.body.search
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body);
  console.log(request.body.search);
  
  // can we convert this to ternary?
  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { searchResults: results }));
}


