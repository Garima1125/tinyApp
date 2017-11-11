var express = require("express");
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

var uId_length = 8;
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function generateRandomString(){
  var result = '';
  for (var i = 0; i < uId_length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var urlDatabase = {}

app.get("/", (req, res) => {
  res.render("hello");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
  console.log(users);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

function urlsForUser(id){
  var newUrlDatabase ={}
  for( var shortUrl in urlDatabase){
    if(urlDatabase[shortUrl]['userID'] === id){
      newUrlDatabase[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return newUrlDatabase;
}

app.get("/urls", (req, res) => {
  var filteredUrlDatabase = urlsForUser(req.session["user_id"])
  let templateVars = { urls: filteredUrlDatabase, users: users, user_id: req.session["user_id"]};
  res.render("urls_index",templateVars);
});

app.get("/urls/new", (req, res) => {
  console.log(req.session.user_id);
  if(req.session.user_id == undefined){
    res.redirect("/login");
  } else {
    let templateVars = { users: users,user_id: req.session.user_id};
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id, 
    long: urlDatabase[req.params.id]['longUrl'],
    users: users,
    user_id: req.session["user_id"] 
  };
  var userid = urlDatabase[req.params.id]['userID'];
  if(req.session["user_id"] == undefined){
   res.status(403).send('We could not find you in our system. Please login or register first.');
 } else if(req.session['user_id'] !== userid){
  res.status(403).send("You don't have access to this URL");
 } else{
  res.render("urls_show", templateVars);
 }
});

app.post("/urls", (req, res) => {
  var long = req.body.longUrl;
  var shortUrl = generateRandomString();
  var user_id = req.session["user_id"];
  urlDatabase[shortUrl]={};
  urlDatabase[shortUrl]['shortUrl'] = shortUrl; 
  urlDatabase[shortUrl]['longUrl'] = long; 
  urlDatabase[shortUrl]['userID'] = user_id;
  console.log(urlDatabase);
  res.redirect("urls/"); 
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]['longUrl'];
  console.log(longURL);
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req,res)=> {
  delete urlDatabase[req.params.id]
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:id", (req,res)=> {
  var long = req.body.longUrl;
  var shortUrl =req.params.id;
  urlDatabase[shortUrl]['longUrl'] = long;
  console.log(urlDatabase);
  res.redirect("/urls"); 
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  for(var user in users) {
    if(users[user].email === email) {
      bcrypt.compare(req.body.password, users[user]['password'], function(err, result) {
        if(result) {
          var user_id = users[user].id;
          req.session.user_id = user_id;
          res.redirect("/urls");
        } else {
          res.status(403).send('User does not exist. Please register first.')
        }
      })
    }
  } 
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("user_registration");
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password ,10);
  console.log(hashedPassword);
  let user_id = generateRandomString();
  users[user_id] = {id: user_id, email: email, password: hashedPassword}
  console.log(users);
  req.session.user_id = user_id;
  
  for(var user in users){
    if(!email || !password ) {
      res.status(400).send('Both Email and Password required')
    } else if(users[user].email == email){
       res.status(400).send('User already exist')
    } else {
      res.redirect("/");
    }
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});





