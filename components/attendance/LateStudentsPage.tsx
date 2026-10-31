
"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

type Student = {
  id: string;
  name: string;
};

type LateRecord = {
  id: string;
  date: string;
  time: string;
  grade: string;
  section: string;
  student: string;
  minutes: string;
  reason: string;
};

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
}

export default function LateStudentsPage() {
  const [user, setUser] = useState<User | null>(null);

  const [date, setDate] = useState(getToday());
  const [time, setTime] = useState(getCurrentTime());
  const [grade, setGrade] = useState("6");
  const [section, setSection] = useState("а");

  const [students, setStudents] = useState<Student[]>([]);
  const [student, setStudent] = useState("");

  const [minutes, setMinutes] = useState("5");
  const [reason, setReason] = useState("");

  const [records, setRecords] = useState<LateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [sectionOpen, setSectionOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);
  

  // Нэвтэрсэн хэрэглэгчийг шалгах
  useEffect(() => {
    if (!auth) return;

    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  // Сонгосон анги, бүлгийн сурагчдыг Firebase-ээс татах
  useEffect(() => {
    if (!db || !user) {
      setStudents([]);
      setStudent("");
      return;
    }

    let cancelled = false;

    async function loadStudents() {
      setLoading(true);
      setStudents([]);
      setStudent("");

      try {
        
        const studentsQuery = query(
  collection(db!, "students"),
  where("grade", "==", grade)
);

const snapshot = await getDocs(studentsQuery);

if (cancelled) return;

const normalizedSection = section.trim().toLocaleLowerCase();

const list: Student[] = snapshot.docs
  .filter((item) => {
    const data = item.data();

    return (
      String(data.section || "").trim().toLocaleLowerCase() ===
      normalizedSection
    );
  })
  .map((item) => ({
    id: item.id,
    name: String(item.data().name || ""),
  }))
  .filter((item) => item.name);

setStudents(list);
setStudent(list[0]?.id || "");   

        setStudents(list);
        setStudent(list[0]?.id || "");

      } catch (error) {
        console.error("Сурагч татах алдаа:", error);
        setMessage("Сурагчдын мэдээлэл татахад алдаа гарлаа.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadStudents();

    return () => {
      cancelled = true;
    };
  }, [user, grade, section]);

  // Өмнө бүртгэсэн хоцролтуудыг Firebase-ээс татах
  useEffect(() => {
    if (!db || !user) {
      setRecords([]);
      return;
    }

    let cancelled = false;

    async function loadRecords() {
      try {
        const recordsQuery = query(
          collection(db!, "lateRecords"),
          where("teacherUid", "==", user!.uid)
        );

        const snapshot = await getDocs(recordsQuery);

        if (cancelled) return;

        const list: LateRecord[] = snapshot.docs.map((item) => {
          const data = item.data();

          return {
            id: item.id,
            date: String(data.date || ""),
            time: String(data.time || ""),
            grade: String(data.grade || ""),
            section: String(data.section || ""),
            student: String(data.student || ""),
            minutes: String(data.minutes || ""),
            reason: String(data.reason || ""),
          };
        });

        list.sort((a, b) =>
          `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
        );

        setRecords(list);
      } catch (error) {
        console.error("Хоцролт унших алдаа:", error);
        setMessage("Хоцролтын бүртгэл уншихад алдаа гарлаа.");
      }
    }

    void loadRecords();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Хоцролт Firebase-д хадгалах
  async function saveRecord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!db || !user) {
      setMessage("Та эхлээд системд нэвтэрнэ үү.");
      return;
    }

    const selectedStudent = students.find((s) => s.id === student);

    if (!selectedStudent) {
      setMessage("Сурагч сонгоно уу.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const record = {
        teacherUid: user.uid,
        date,
        time,
        grade,
        section,
        student: selectedStudent.name,
        studentId: selectedStudent.id,
        minutes,
        reason: reason.trim() || "Шалтгаан тэмдэглээгүй",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "lateRecords"),
        record
      );

      setRecords((current) => [
        {
          id: docRef.id,
          date,
          time,
          grade,
          section,
          student: selectedStudent.name,
          minutes,
          reason: record.reason,
        },
        ...current,
      ]);

      setMessage("Хоцролтын бүртгэл Firebase-д амжилттай хадгалагдлаа.");
      setReason("");
      setMinutes("5");

    } catch (error) {
      console.error("ХОЦРОЛТ ХАДГАЛАХ АЛДАА:", error);
      setMessage("Хоцролт хадгалахад алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="attendance-page">
      <form className="login-form" onSubmit={saveRecord}>
        <label className="date-label">
          Огноо
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <label className="date-label">
          Хоцорсон цаг
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </label>

        <div
            style={{
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: 10,
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  }}
        >
          <label className="date-label">
            Анги
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              style={{
                minHeight: 42,
                border: "1px solid #e5eaf1",
                borderRadius: 9,
                padding: 8,
              }}
            >
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(
                (g) => (
                  <option key={g} value={g}>
                    {g}-р анги
                  </option>
                )
              )}
            </select>
          </label>
          <label className="date-label">
  Бүлэг

  <button
    type="button"
    onClick={() => setSectionOpen(!sectionOpen)}
    style={{
      width: 65,
      height: 38,
      border: "1px solid #dbe3ef",
      borderRadius: 7,
      background: "#f8fafc",
      fontSize: 13,
      fontWeight: 600,
    }}
  >
    {section} ▼
  </button>

  {sectionOpen && (
    <div
      style={{
        width: 65,
        height: 96,
        overflowY: "auto",
        border: "1px solid #dbe3ef",
        borderRadius: 7,
        background: "#fff",
      }}
    >
      {[
        "А", "Б", "В", "Г", "Д",
        "Е", "Ё", "Ж", "З", "И",
        "Й", "К", "Л", "М", "Н",
        "О", "Ө", "П", "Р", "С"
      ].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => {
            setSection(s);
            setSectionOpen(false);
          }}
          style={{
            display: "block",
            width: "100%",
            height: 24,
            border: "none",
            background: section === s ? "#dbeafe" : "white",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          {s}
        </button>
      ))}
    </div>
  )}
</label>
        </div>

        <label className="date-label" style={{ position: "relative" }}>
  Сурагчийн нэр

  <button
    type="button"
    onClick={() => setStudentOpen(!studentOpen)}
    disabled={loading || students.length === 0}
    style={{
      width: "100%",
      height: 42,
      border: "1px solid #dbe3ef",
      borderRadius: 7,
      background: "#f8fafc",
      fontSize: 13,
      fontWeight: 600,
      textAlign: "left",
      padding: "0 12px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <span>
      {loading
        ? "Уншиж байна..."
        : students.find((s) => String(s.id) === student)?.name ||
          "Сурагч сонгох"}
    </span>
    <span>{studentOpen ? "▲" : "▼"}</span>
  </button>

  {studentOpen && (
    <div
      style={{
        position: "absolute",
        zIndex: 50,
        top: "100%",
        left: 0,
        width: "100%",
        maxHeight: 112,
        overflowY: "auto",
        border: "1px solid #dbe3ef",
        borderRadius: 7,
        background: "#fff",
        boxShadow: "0 5px 15px #00000012",
      }}
    >
      {students.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => {
            setStudent(String(s.id));
            setStudentOpen(false);
          }}
          style={{
            display: "block",
            width: "100%",
            minHeight: 28,
            border: "none",
            borderBottom: "1px solid #f1f5f9",
            background:
              student === String(s.id) ? "#dbeafe" : "#fff",
            fontSize: 13,
            textAlign: "left",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          {s.name}
        </button>
      ))}
    </div>
  )}
</label>
        <label className="date-label">
          Хоцорсон минут
          <input
            type="number"
            min="1"
            max="600"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            required
            style={{
              minHeight: 42,
              border: "1px solid #e5eaf1",
              borderRadius: 9,
              padding: 8,
            }}
          />
        </label>

        <label className="date-label">
          Шалтгаан
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Жишээ: автобус хоцорсон"
            rows={3}
            style={{
              border: "1px solid #e5eaf1",
              borderRadius: 9,
              padding: 10,
              resize: "vertical",
            }}
          />
        </label>

        <button
          className="primary-btn"
          type="submit"
          disabled={saving || loading || !student}
        >
          {saving ? "Хадгалж байна..." : "Хоцролт бүртгэх"}
        </button>
      </form>

      {message && (
        <p className="success-message">{message}</p>
      )}

      <h3>Бүртгэсэн хоцролт</h3>

      {records.length === 0 ? (
        <p className="hint">Одоогоор бүртгэл алга.</p>
      ) : (
        records.map((r) => (
          <div
            key={r.id}
            className="notice"
            style={{ marginBottom: 8 }}
          >
            <strong>
              {r.grade}-р анги {r.section} — {r.student}
            </strong>
            <p>
              {r.date}, {r.time} · {r.minutes} минут
            </p>
            <p>{r.reason}</p>
          </div>
        ))
      )}
    </div>
  );
}
