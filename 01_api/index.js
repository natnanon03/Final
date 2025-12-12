const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

const app = express();
app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

// health check
app.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error" });
  }
});

// get all todos
app.get('/todos', async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM todo ORDER BY id DESC");
  res.json(rows);
});

// create todo
app.post('/todos', async (req, res) => {
  const { title } = req.body;
  await pool.query("INSERT INTO todo (title) VALUES (?)", [title]);
  res.json({ message: "created" });
});

// toggle complete
app.patch('/todos/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query("UPDATE todo SET completed = NOT completed WHERE id = ?", [id]);
  res.json({ message: "updated" });
});

app.listen(process.env.PORT, () => {
  console.log("API running on port " + process.env.PORT);
});
