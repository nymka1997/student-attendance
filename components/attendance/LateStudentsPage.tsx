"use client";

import { useState } from "react";

type LateRecord = {
  id: number;
  date: string;
  time: string;
  grade: string;
  section: string;
  student: string;
  minutes: string;
  reason: string;
};

const demoStudents = ["Бат-Эрдэнэ", "Болор", "Ганзориг", "Мөнхжин", "Саруул", "Тэмүүлэн", "Уянга", "Энхжин", "Анужин", "Дөлгөөн"];

export default function LateStudentsPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [grade, setGrade] = useState("6");
  const [section, setSection] = useState("а");
  const [student, setStudent] = useState(demoStudents[0]);
  const [minutes, setMinutes] = useState("5");
  const [reason, setReason] = useState("");
  const [records, setRecords] = useState<LateRecord[]>([]);
  const [message, setMessage] = useState("");

  function saveRecord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const record: LateRecord = {
      id: Date.now(), date, time, grade, section, student, minutes,
      reason: reason.trim() || "Шалтгаан тэмдэглээгүй",
    };
    setRecords(current => [record, ...current]);
    setMessage("Хоцролтын бүртгэл энэ хуудсанд нэмэгдлээ.");
    setReason("");
  }

  return (
    <div className="attendance-page">
      <form className="login-form" onSubmit={saveRecord}>
        <label className="date-label">Огноо
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </label>
        <label className="date-label">Хоцорсон цаг
          <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label className="date-label">Анги
            <select value={grade} onChange={e => setGrade(e.target.value)} style={{ minHeight: 42, border: "1px solid #e5eaf1", borderRadius: 9, padding: 8 }}>
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(g => <option key={g} value={g}>{g}-р анги</option>)}
            </select>
          </label>
          <label className="date-label">Бүлэг
            <select value={section} onChange={e => setSection(e.target.value)} style={{ minHeight: 42, border: "1px solid #e5eaf1", borderRadius: 9, padding: 8 }}>
              {["а", "б", "в", "г", "д", "е", "ё"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <label className="date-label">Сурагчийн нэр
          <select value={student} onChange={e => setStudent(e.target.value)} style={{ minHeight: 42, border: "1px solid #e5eaf1", borderRadius: 9, padding: 8 }}>
            {demoStudents.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <label className="date-label">Хоцорсон минут
          <input type="number" min="1" max="600" value={minutes} onChange={e => setMinutes(e.target.value)} required style={{ minHeight: 42, border: "1px solid #e5eaf1", borderRadius: 9, padding: 8 }} />
        </label>
        <label className="date-label">Шалтгаан
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Жишээ: автобус хоцорсон" rows={3} style={{ border: "1px solid #e5eaf1", borderRadius: 9, padding: 10, resize: "vertical" }} />
        </label>
        <button className="primary-btn" type="submit">Хоцролт бүртгэх</button>
      </form>
      {message && <p className="success-message">{message} Одоогоор зөвхөн local түр төлөвт хадгална.</p>}
      <h3>Бүртгэсэн хоцролт</h3>
      {records.length === 0 ? <p className="hint">Одоогоор бүртгэл алга.</p> : records.map(r => (
        <div key={r.id} className="notice" style={{ marginBottom: 8 }}>
          <strong>{r.grade}-р анги {r.section} — {r.student}</strong>
          <p>{r.date}, {r.time} · {r.minutes} минут</p>
          <p>{r.reason}</p>
        </div>
      ))}
    </div>
  );
}
