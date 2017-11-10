var express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser")

var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
app.use(cookieParser());
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

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};

app.get("/", (req, res) => {
  res.end("Hello!");
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

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, users: users, user_id: req.cookies["user_id"]};
  res.render("urls_index",templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { users: users,user_id: req.cookies["user_id"]};

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, long: urlDatabase[req.params.id],users: users,user_id: req.cookies["user_id"] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  var long = req.body.longUrl;
  var shortUrl = generateRandomString();
  urlDatabase[shortUrl] = long;
  console.log(urlDatabase);
  res.redirect("urls/"+shortUrl); 
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
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
  urlDatabase[shortUrl] = long;
  console.log(urlDatabase);
  res.redirect("/urls"); 
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password

  for(var user in users) {
    if(users[user].email == email && users[user].password == password){
      var user_id = users[user].id;
      res.cookie('user_id',user_id);
      res.redirect("/");
    } else {
     res.status(403).send('User does not exist. Please register first.')
   }
  } 
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("user_registration");
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user_id = generateRandomString();
  users[user_id] = {id: user_id, email: email, password: password}
  res.cookie('user_id', user_id )
  
  
  for(var user in users){
  if(!email || !password ){
    res.status(400).send('Both Email and Password required')
  } 
  else if(users[user].email == email){
     res.status(400).send('User already exist')
  } else{
    res.redirect("/urls");
  }
}
 //res.render("user_registration") 
});

app.get("/login", (req, res) => {
  
  res.render("login");
});





