const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

const port = 3000;

const cats = [
  { id: 1, name: "Alpha", refresh: null },
  { id: 2, name: "Beta", refresh: null },
  { id: 3, name: "Gamma", refresh: null },
  { id: 4, name: "Delta", refresh: null },
];

const jwtGenerate = (user) => {
  const accessToken = jwt.sign(
    { name: user.name, id: user.id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10s", algorithm: "HS256" }
  );

  return accessToken;
};

const jwtRefreshTokenGenerate = (user) => {
  const refreshToken = jwt.sign(
    { name: user.name, id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d", algorithm: "HS256" }
  );

  return refreshToken;
};

const jwtValidate = (req, res, next) => {
  try {
    if (!req.headers["authorization"]) return res.sendStatus(401);

    const token = req.headers["authorization"].replace("Bearer ", "");

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) throw new Error(err);
    });
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
};

const jwtRefreshTokenValidate = (req, res, next) => {
  try {
    if (!req.headers["authorization"]) return res.sendStatus(401);
    const token = req.headers["authorization"].replace("Bearer ", "");

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) throw new Error(err);

      req.user = decoded;
      req.user.token = token;
      delete req.user.exp;
      delete req.user.iat;
    });
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
};

app.post("/auth/login", (req, res) => {
  const { name } = req.body;

  //find user
  const cat = cats.findIndex((e) => e.name === name);

  if (!name || cat < 0) {
    return res.send(400);
  }

  const access_token = jwtGenerate(cats[cat]);
  const refresh_token = jwtRefreshTokenGenerate(cats[cat]);

  cats[cat].refresh = refresh_token;

  res.json({
    access_token,
    refresh_token,
  });
});

app.post("/auth/refresh", jwtRefreshTokenValidate, (req, res) => {
  const cat = cats.find(
    (e) => e.id === req.user.id && e.name === req.user.name
  );

  const catIdx = cats.findIndex((e) => e.refresh === req.user.token);

  if (!cat || catIdx < 0) return res.sendStatus(401);

  const access_token = jwtGenerate(cat);
  const refresh_token = jwtRefreshTokenGenerate(cat);
  console.log(catIdx);
  cats[catIdx].refresh = refresh_token;
  console.log(cats);

  return setTimeout(
    () =>
      res.json({
        access_token,
        refresh_token,
      }),
    5000
  );
});

app.get("/", jwtValidate, (req, res) => {
  res.send("Hello Cat!");
});

app.get("/b", jwtValidate, (req, res) => {
  res.send("Hello Cat B!");
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
