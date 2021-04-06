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
app.set('view engine', 'ejs');     // Set the view engine for server-side templating

// API Routes
app.get('/', renderHomePage);// Renders the home page
app.get('/searches/new', showForm);// Renders the search form
app.post('/searches', createSearch);// Creates a new search to the Google Books API
app.get('/books/:id', getABook);
app.post('/books', saveBook);

// Catch-all
app.use('*', (request, response) => response.status(404).send('This route does not exist'));

client.connect().then(() => app.listen(PORT, () => console.log(`Listening on port: ${PORT}`)));         //listen when you connict with database

function errorHandler(err, res) {
    res.status(500).render('pages/error', { error: 'there is wrong' });
}

// HELPER FUNCTIONS
// Only show part of this to get students started
function Book(data) {
    this.title = data.title || 'No title available';
    this.author = (data.authors) ? data.authors.join(',') : 'No author available';
    this.descriptions = data.description || 'No description available';
    this.image_url = (data.imageLinks) ? data.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.isbn = (data.industryIdentifiers && data.industryIdentifiers[0].identifier) ? data.industryIdentifiers[0].identifier : 'No ISBN available' ;
    // console.log(data);
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

  // console.log(request.body);
  // console.log(request.body.search);
  
  // can we convert this to ternary?
  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { searchResults: results }));
}

function getABook(req, res){
const sql = 'select * from books where id=$1;';
// console.log(req.params.id);
client.query(sql , [req.params.id])
.then(resulte =>{
  res.render('pages/books/show', {book:resulte.rows[0]});
})
.catch((error) => errorHandler(error, response));
}

function saveBook(req, res){
  const sql = `INSERT INTO books (author,title,isbn,image_url,descriptions) VALUES ($1,$2,$3,$4,$5) RETURNING id;`
  const data = req.body;
  // console.log(req.body);
  const values = [data.author, data.title,data.isbn,data.image_url,data.descriptions];
  client.query(sql ,values)
.then(resulte =>{
  res.redirect(`/books/${resulte.rows[0].id}`);
})
.catch((error) => errorHandler(error, res));
}
