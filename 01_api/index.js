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
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// GET all todos — ส่ง date + time ให้ฝั่ง frontend ใช้
app.get('/todos', async (req, res) => {
  const [rows] = await pool.query(`
      SELECT 
        id,
        title,
        completed,
        DATE(event_datetime) AS date,
        TIME_FORMAT(event_datetime, '%H:%i') AS time,
        event_datetime
      FROM todo
      ORDER BY event_datetime ASC, id ASC
    `);

  res.json(rows);
});

// CREATE todo (รับ title, date, time)
app.post('/todos', async (req, res) => {
  const { title, date, time } = req.body;

  const finalDate = date ?? new Date().toISOString().split("T")[0];
  const finalTime = time ?? "00:00:00";

  const eventDT = `${finalDate} ${finalTime}`;

  await pool.query(
    "INSERT INTO todo (title, event_datetime) VALUES (?, ?)",
    [title, eventDT]
  );

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
