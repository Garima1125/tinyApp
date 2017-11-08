var express = require("express");
const bodyParser = require("body-parser");

var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

var uId_length = 8;
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function generateRandomString(){
   var result = '';
   for (var i = 0; i < uId_length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
   }
   return result;
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

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index",templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, long: urlDatabase[req.params.id] };
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


