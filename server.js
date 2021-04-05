'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');

// Application Setup
const app = express();
const PORT = process.env.PORT || 3001;

// Application Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public/styles'));
app.use(errorHandler);
// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes
app.get('/', renderHomePage);  // Renders the home page
app.get('/searches/new', showForm);  // Renders the search form
app.post('/searches', createSearch);// Creates a new search to the Google Books API

// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

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
    this.title = data.title || 'No title avelable';
    this.author = data.authors.join(' ,') || 'No authors avelable';
    this.description = data.description || 'No description avelable';
    this.image = (data.imageLinks) ? data.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    console.log(this.description);
  }

// Note that .ejs file extension is not required

function renderHomePage(request, response) {
  response.render('pages/index');
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
  // how will we handle errors?
}




// 'use strict';
// require('dotenv').config();
// const express = require('express');
// const superAgent = require('superagent');

// const app = express();
// const PORT = process.env.PORT || 3003;

//          //to pass data from post
// app.use(express.urlencoded({extended: true}));
// app.use(express.static('public')); //


// app.set('view engine', 'ejs'); //search from view with extintion .ejs

// app.get('/', renderHome)
// app.get('/pages', showForm);
// app.post('/searches', createSearch);

// app.listen(PORT , () => console.log(`Hi I'M LISTINING TO ${PORT}`));
// app.get('*', (req, res) => res.status(404).send('this rout DNE'));


// function renderHome(req, res){
//     res.render('pages/index')
// }
// function showForm(req, res){
//     res.render('pages/searches/show');
// }
// function createSearch(req, res){
//     console.log('fdfdf');
//     const url = `https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=yourAPIKey`
//     const search = req.item.search[0]
//     console.log(search);
//     superAgent.get(url).then()
//     res.send('');
// }

// // function Book(){
// // this.title = title;

// // }
