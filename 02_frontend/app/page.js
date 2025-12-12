"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const API_HOST = process.env.NEXT_PUBLIC_API_HOST;
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("12:00");

  const loadTodos = async () => {
    const res = await fetch(`${API_HOST}/todos`);
    const data = await res.json();

    // แปลง event_datetime → date + time
    const parsed = data.map((t) => {
      if (!t.event_datetime) return t;
      const [d, timePart] = t.event_datetime.split("T");
      return {
        ...t,
        date: d,
        time: timePart.substring(0, 5),
      };
    });

    setTodos(parsed);
  };

  const addTodo = async () => {
    if (!title.trim()) return;

    await fetch(`${API_HOST}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        date,
        time: time + ":00",
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

  // กลุ่มวัน
  const groupByDate = () => {
    const grouped = {};

    todos.forEach((t) => {
      const d = t.date || "ไม่ระบุวันที่";
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(t);
    });

    return Object.keys(grouped)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => ({
        date,
        items: grouped[date].sort((a, b) =>
          (a.time || "").localeCompare(b.time || "")
        ),
      }));
  };

  const thaiDay = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

  const formatHeader = (date) => {
    const d = new Date(date + "T00:00:00");
    return `วัน${thaiDay[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
  };

  const groups = groupByDate();

  return (
    <main className="container">
      <h1>🗂️ To-Do List (แสดงทั้งหมด + แยกวัน)</h1>

      {/* เพิ่มงาน */}
      <div className="add-box">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เพิ่มงานใหม่..."
        />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <button onClick={addTodo}>เพิ่ม</button>
      </div>

      {/* แสดงตามวัน */}
      {groups.map(({ date, items }) => {
        const pending = items.filter((t) => !t.completed);
        const done = items.filter((t) => t.completed);

        return (
          <div key={date} className="day-group">
            <h2 className="day-header">
              {formatHeader(date)}
              <span className="count">({pending.length} งานค้าง)</span>
            </h2>

            {/* ค้าง */}
            <h3>🟡 งานที่ยังไม่เสร็จ</h3>
            {pending.length === 0 ? (
              <div className="empty-state">ไม่มีงานค้าง 🎉</div>
            ) : (
              <ul className="todo-list">
                {pending.map((t) => (
                  <li key={t.id} onClick={() => toggleComplete(t.id)}>
                    <span className="check-mark">○</span>
                    <span>[{t.time}] {t.title}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* เสร็จแล้ว */}
            <h3>🟢 งานที่เสร็จแล้ว</h3>
            {done.length === 0 ? (
              <div className="empty-state">ยังไม่มีงานเสร็จ</div>
            ) : (
              <ul className="todo-list">
                {done.map((t) => (
                  <li key={t.id} className="done" onClick={() => toggleComplete(t.id)}>
                    <span className="check-mark">✓</span>
                    <span>[{t.time}] {t.title}</span>
                  </li>
                ))}
              </ul>
            )}
            <hr />
          </div>
        );
      })}
    </main>
  );
}
