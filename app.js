const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const ejs = require("ejs");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));

const db = mysql.createConnection({
  host: "localhost",
  user: "kanav",
  password: "cse@123",
  database: "mydb",
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/index.html"));
});

app.get("/userdata", (req, res) => {
  const sql = "SELECT * FROM contacts";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching data: " + err);
      res.status(500).send("Error fetching data");
      return;
    }

    res.render("userdata", { userData: result });
  });
});

app.post("/submit", upload.single("image"), (req, res) => {
  const { name, email } = req.body;
  const image = req.file;

  if (!image) {
    res.status(400).send("Image upload is required.");
    return;
  }

  const imagePath = image.path;

  const sql = "INSERT INTO contacts (name, email, image_path) VALUES (?, ?, ?)";

  db.query(sql, [name, email, imagePath], (err, result) => {
    if (err) {
      console.error("Error inserting data: " + err);
      res.status(500).send("Error submitting the form");
      return;
    }

    console.log("Data inserted into the database");
    res.redirect("/userdata"); // Redirect to the user data page
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
