if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const mapRouter = require('./routes/places');


const app = express();
const port = 3000;

const initializePassport = require('./passport');
initializePassport(
    passport,
    username => users.find(user => user.username === username), 
    id => users.find(user => user.id === id),
)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.urlencoded({ extended: false}));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use('/places', mapRouter);

const users = []

const places = [{
  name: 'Name of Listing',
  uploader: 'Username of the Uploader',
  description: 'Short Description',
  address: 'Address'
},
{
  name: 'Name of Listing2',
  uploader: 'Username of the Uploader2',
  description: 'Short Description2',
  address: 'Address2'
},
{
  name: 'Name of Listing3',
  uploader: 'Username of the Uploader3',
  description: 'Short Description3',
  address: 'Address3'
}]

app.get('/', checkNotAuthenticated, async (req, res) => {
    res.render('places/!signed-in', {  place1: places[0], place2: places[1], place3: places[2] });
})

//Signed-in page
app.get('/signed-in', checkAuthenticated, async (req, res) =>{
  res.render('places/signed-in', {  place1: places[0], place2: places[1], place3: places[2] });
})

//Sign-in page
app.get('/sign-in', checkNotAuthenticated, (req, res) =>{
  res.render('sign-in');
})

app.post('/sign-in', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/signed-in', 
  failureRedirect: '/sign-in',
  failureFlash: true
}))

//Sign-out 
app.post('/signed-in', function(req, res, next) {
  req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
  });
});

//Sign-up page
app.get('/sign-up', checkNotAuthenticated, (req, res) =>{
  res.render('sign-up');
})


app.post('/sign-up', checkNotAuthenticated, async (req, res) =>{
  
  try {
  const hashedPassword = await bcrypt.hash(req.body.password, 10)
      users.push({
          id: Date.now().toString(),
          username: req.body.username,
          password: hashedPassword
      })
      res.redirect('/sign-in');
  } catch {
      res.redirect('/sign-up')
  }
  console.log(users);
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return res.redirect('/signed-in');
  }
  next();
}

//Indidual Listing Page - Not Signed-in
app.get('/!signed-in-show1', (req, res) => {
  res.render('places/!signed-in/show1', {  place1: places[0] })
})

app.get('/!signed-in-show2', (req, res) => {
  res.render('places/!signed-in/show2', {  place2: places[1] })
})

app.get('/!signed-in-show3', (req, res) => {
  res.render('places/!signed-in/show3', {  place3: places[2] })
})

//Indidual Listing Page - Signed-in
app.get('/show1', (req, res) => {
  res.render('places/signed-in/show1', {  place1: places[0] })
})

app.get('/show2', (req, res) => {
  res.render('places/signed-in/show2', {  place2: places[1] })
})

app.get('/show3', (req, res) => {
  res.render('places/signed-in/show3', {  place3: places[2] })
})

//Reviews
app.get('/reviews', (req, res) => {
  res.render('places/reviews');
})



//Listen to localhost:3000
app.listen(port, () =>{
  console.log("Listening on port", port);
})