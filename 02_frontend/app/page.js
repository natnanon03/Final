"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const API_HOST = process.env.NEXT_PUBLIC_API_HOST;

  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");

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
      body: JSON.stringify({ title }),
    });

    setTitle("");
    loadTodos();
  };

  const toggleComplete = async (id) => {
    await fetch(`${API_HOST}/todos/${id}`, { method: "PATCH" });
    loadTodos();
  };

  useEffect(() => {
    loadTodos();
  }, []);

  return (
    <main className="container">
      <h1>To-Do List</h1>

      <div className="add-box">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เพิ่มงานใหม่..."
        />
        <button onClick={addTodo}>เพิ่ม</button>
      </div>

      <ul className="todo-list">
        {todos.map((t) => (
          <li
            key={t.id}
            className={t.completed ? "done" : ""}
            onClick={() => toggleComplete(t.id)}
          >
            {t.title}
          </li>
        ))}
      </ul>
    </main>
  );
}
