const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");

const User = require("./models/User");

const port = 5000;

const app = express();

dotenv.config();
app.set("view engine", "ejs");
mongoose
  .connect(process.env.APP_MONGODB_FULL_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.APP_MONGO_DB_NAME,
  })
  .catch((err) => console.log("HATA: MongoBD bağlantısı yapılamadı: ", err));

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  // session aç
  session({
    secret: process.env.APP_SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.APP_MONGODB_FULL_URL,
      dbName: process.env.APP_MONGO_DB_NAME,
    }),
  })
);

app.get("/login", async (req, res) => {
  const user = await User.findOne({});
  const login = user ? true : false;
  res.status(200).render("login", { pageName: "login", login: login });
});

app.post("/register", async (req, res) => {
  const user = await User.findOne({});

  if (user) res.redirect("/login");
  else {
    console.log("kullanıcı oluşturuluyor")
    const userInfo = {
      email: req.body.email,
      password: req.body.password,
    };
    const newUser = await User.create(userInfo);
    if (newUser) res.status(201).redirect("/login");
    else res.status(400).render("/login", { pageName: "login", login: false });
  }
});

app.get("/", (req, res) => {
  res.render("index", { pageName: "home" });
});

app.listen(port, (err) => {
  if (err) console.log(err);
  else console.log("Sunucu başarı ile başlatıldı.");
});
