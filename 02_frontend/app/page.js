"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const API_HOST = process.env.NEXT_PUBLIC_API_HOST;
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("12:00");
  const [selectedDate, setSelectedDate] = useState("all"); // all, today, specific date

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
        time: timePart ? timePart.substring(0, 5) : "00:00",
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

  // สร้างตัวเลือกวันที่ 7 วัน
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };

  const dates = generateDates();
  const todayString = new Date().toISOString().split("T")[0];

  // ฟังก์ชันช่วย
  const thaiDay = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

  const getThaiDay = (dateString) => {
    const d = new Date(dateString + "T00:00:00");
    return thaiDay[d.getDay()];
  };

  const getShortDate = (dateString) => {
    const d = new Date(dateString + "T00:00:00");
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const formatHeader = (dateString) => {
    const d = new Date(dateString + "T00:00:00");
    return `วัน${thaiDay[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // กรองและจัดกลุ่มข้อมูล
  const getFilteredTodos = () => {
    if (selectedDate === "all") {
      return todos;
    } else if (selectedDate === "today") {
      return todos.filter((t) => t.date === todayString);
    } else {
      return todos.filter((t) => t.date === selectedDate);
    }
  };

  const groupByDate = (todoList) => {
    const grouped = {};

    todoList.forEach((t) => {
      const d = t.date || "ไม่ระบุวันที่";
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(t);
    });

    return Object.keys(grouped)
      .sort((a, b) => {
        if (a === "ไม่ระบุวันที่") return 1;
        if (b === "ไม่ระบุวันที่") return -1;
        return new Date(a) - new Date(b);
      })
      .map((date) => ({
        date,
        items: grouped[date].sort((a, b) =>
          (a.time || "").localeCompare(b.time || "")
        ),
      }));
  };

  const filteredTodos = getFilteredTodos();
  const groups = groupByDate(filteredTodos);

  // นับจำนวนงานแต่ละวัน
  const getCountByDate = (d) => {
    return todos.filter((t) => t.date === d && !t.completed).length;
  };

  return (
    <main className="container">
      <h1>📝 My To-Do List</h1>

      {/* ตัวกรองวันที่ */}
      <div className="date-filter">
        <button
          className={`filter-btn ${selectedDate === "all" ? "active" : ""}`}
          onClick={() => setSelectedDate("all")}
        >
          ทั้งหมด
        </button>
        <button
          className={`filter-btn ${selectedDate === "today" ? "active" : ""}`}
          onClick={() => setSelectedDate("today")}
        >
          วันนี้
        </button>
      </div>

      {/* เลือกวันเฉพาะ */}
      <div className="date-selector">
        {dates.map((d) => {
          const count = getCountByDate(d);
          const isToday = d === todayString;

          return (
            <button
              key={d}
              className={`date-btn ${selectedDate === d ? "active" : ""}`}
              onClick={() => setSelectedDate(d)}
            >
              <div className="day-name">
                {isToday ? "วันนี้" : getThaiDay(d)}
              </div>
              <div className="date-num">{getShortDate(d)}</div>
              {count > 0 && <div className="count-badge">{count}</div>}
            </button>
          );
        })}
      </div>

      {/* เพิ่มงานใหม่ */}
      <div className="add-box">
        <input
          className="input-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
          placeholder="เพิ่มงานใหม่..."
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-date"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="input-time"
        />
        <button onClick={addTodo} className="btn-add">เพิ่ม</button>
      </div>

      {/* แสดงงานตามวัน */}
      {groups.length === 0 ? (
        <div className="empty-all">ไม่มีงานในช่วงที่เลือก 🎉</div>
      ) : (
        groups.map(({ date, items }) => {
          const pending = items.filter((t) => !t.completed);
          const done = items.filter((t) => t.completed);

          return (
            <div key={date} className="day-group">
              <h2 className="day-header">
                {date === "ไม่ระบุวันที่" ? "ไม่ระบุวันที่" : formatHeader(date)}
                <span className="count-header">
                  ({pending.length} ค้าง / {done.length} เสร็จ)
                </span>
              </h2>

              {/* งานค้าง */}
              {pending.length > 0 && (
                <>
                  <h3 className="section-title pending">🟡 งานที่ยังไม่เสร็จ</h3>
                  <ul className="todo-list">
                    {pending.map((t) => (
                      <li key={t.id} onClick={() => toggleComplete(t.id)}>
                        <span className="check-mark">○</span>
                        <span className="todo-content">
                          <span className="todo-time">{t.time}</span>
                          <span className="todo-text">{t.title}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* งานเสร็จแล้ว */}
              {done.length > 0 && (
                <>
                  <h3 className="section-title done">🟢 งานที่เสร็จแล้ว</h3>
                  <ul className="todo-list">
                    {done.map((t) => (
                      <li
                        key={t.id}
                        className="done"
                        onClick={() => toggleComplete(t.id)}
                      >
                        <span className="check-mark">✓</span>
                        <span className="todo-content">
                          <span className="todo-time">{t.time}</span>
                          <span className="todo-text">{t.title}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {pending.length === 0 && done.length === 0 && (
                <div className="empty-state">ไม่มีงานในวันนี้</div>
              )}
            </div>
          );
        })
      )}
    </main>
  );
}