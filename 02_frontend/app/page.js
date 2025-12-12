"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const API_HOST = process.env.NEXT_PUBLIC_API_HOST;

  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("12:00"); // default
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // สร้างวันที่ล่วงหน้า 7 วัน
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const dates = generateDates();

  const getThaiDay = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    const days = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
    return days[date.getDay()];
  };

  const getShortDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const loadTodos = async () => {
    const res = await fetch(`${API_HOST}/todos`);
    const data = await res.json();
    setTodos(data);
  };

  const addTodo = async () => {
    if (!title.trim()) return;

    await fetch(`${API_HOST}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        date: selectedDate,
        time: time + ":00", // backend ต้องการ xx:xx:00
      }),
    });

    setTitle("");
    setTime("12:00");
    loadTodos();
  };

  const toggleComplete = async (id) => {
    await fetch(`${API_HOST}/todos/${id}`, { method: "PATCH" });
    loadTodos();
  };

  useEffect(() => {
    loadTodos();
  }, []);

  // กรองตามวันที่ + เรียงตามเวลา
  const filteredTodos = todos
    .filter((t) => t.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const todayString = new Date().toISOString().split("T")[0];
  const getCountByDate = (date) =>
    todos.filter((t) => t.date === date && !t.completed).length;

  return (
    <main className="container">
      <h1>📝 To-Do List</h1>

      {/* เลือกวัน */}
      <div className="date-selector">
        {dates.map((date) => {
          const count = getCountByDate(date);
          const isToday = date === todayString;

          return (
            <button
              key={date}
              className={`date-btn ${selectedDate === date ? "active" : ""}`}
              onClick={() => setSelectedDate(date)}
            >
              <div>{isToday ? "วันนี้" : getThaiDay(date)}</div>
              <div>{getShortDate(date)}</div>
              {count > 0 && <div className="count-badge">{count}</div>}
            </button>
          );
        })}
      </div>

      {/* เพิ่มงานใหม่ */}
      <div className="add-box">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เพิ่มงานใหม่..."
        />

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <button onClick={addTodo}>เพิ่ม</button>
      </div>

      {/* รายการงาน */}
      <div className="todo-section">
        <h3>
          {selectedDate === todayString
            ? "งานวันนี้"
            : `งานวัน${getThaiDay(selectedDate)}`}
        </h3>

        {filteredTodos.length === 0 ? (
          <div className="empty-state">ไม่มีงานในวันนี้ 🎉</div>
        ) : (
          <ul className="todo-list">
            {filteredTodos.map((t) => (
              <li
                key={t.id}
                className={t.completed ? "done" : ""}
                onClick={() => toggleComplete(t.id)}
              >
                <span className="check-mark">
                  {t.completed ? "✓" : "○"}
                </span>

                <span className="todo-text">
                  {t.time ? `[${t.time}] ` : ""}{t.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
