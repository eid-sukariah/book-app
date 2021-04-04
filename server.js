'use strict';
require('dotenv').config();
const express = require('express');
const superAgent = require('superagent');

const app = express();
const PORT = process.env.PORT || 3003;

         //to pass data from post
app.use(express.urlencoded({extended: true}));
app.use(express.static('public')); //


app.set('view engine', 'ejs'); //search from view with extintion .ejs

app.get('/', renderHome)
app.get('/searches/show', showForm);
app.post('/searches', createSearch);

app.listen(PORT , () => console.log(`Hi I'M LISTINING TO ${PORT}`));
app.get('*', (req, res) => res.status(404).send('this rout DNE'));


function renderHome(req, res){
    res.render('pages/index')
}
function showForm(req, res){
    res.render('pages/searches/show');
}
function createSearch(req, res){
    console.log('fdfdf');
    res.send('');
}