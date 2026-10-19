"use client";

import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, CircleUserRound, Download, Home, LockKeyhole, Eye, EyeOff, UsersRound, Save, Check, FileSpreadsheet, LogOut, Settings, Search } from "lucide-react";
import * as XLSX from "xlsx";
import { isFirebaseConfigured } from "@/lib/firebase";

type Status = "Ирсэн" | "Өвчтэй" | "Чөлөөтэй" | "Тасалсан";
type Student = { id: number; name: string; status: Status | "" };
const grades = Array.from({ length: 12 }, (_, i) => `${i + 1}-р анги`);
const sections = ["а", "б", "в", "г", "д", "е", "ё"].map(x => `6${x}`);
const initialNames = ["Бат-Эрдэнэ", "Болор", "Ганзориг", "Мөнхжин", "Саруул", "Тэмүүлэн", "Уянга", "Энхжин", "Анужин", "Дөлгөөн"];
const statuses: Status[] = ["Ирсэн", "Өвчтэй", "Чөлөөтэй", "Тасалсан"];
const statusClass: Record<Status, string> = { "Ирсэн": "present", "Өвчтэй": "sick", "Чөлөөтэй": "excused", "Тасалсан": "absent" };

export default function HomePage() {
  const [page, setPage] = useState<"login" | "grades" | "sections" | "attendance" | "history" | "profile">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [grade, setGrade] = useState("6-р анги");
  const [section, setSection] = useState("6а");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [students, setStudents] = useState<Student[]>(initialNames.map((name, i) => ({ id: i + 1, name, status: "" })));

  const filteredStudents = useMemo(() => students.filter(s => s.name.toLowerCase().includes(search.toLowerCase())), [students, search]);
  const counts = useMemo(() => statuses.reduce((acc, status) => ({ ...acc, [status]: students.filter(s => s.status === status).length }), {} as Record<Status, number>), [students]);
  const setStatus = (id: number, status: Status) => setStudents(current => current.map(s => s.id === id ? { ...s, status: s.status === status ? "" : status } : s));
  const goBack = () => setPage(page === "attendance" ? "sections" : page === "sections" ? "grades" : "login");
  const exportExcel = () => {
    const rows = students.map((s, i) => ({ "№": i + 1, "Сурагчийн нэр": s.name, "Анги": grade, "Бүлэг": section, "Огноо": date, "Ирцийн төлөв": s.status || "Бүртгээгүй" }));
    rows.push({ "№": "" as unknown as number, "Сурагчийн нэр": "Нийт", "Анги": grade, "Бүлэг": section, "Огноо": date, "Ирцийн төлөв": "" });
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(XLSX.utils.book_new(), sheet, "Ирц");
    const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, "Ирц");
    XLSX.writeFile(book, `irts-${section}-${date}.xlsx`);
  };
  const saveAttendance = () => {
    // Starter mode: the current browser session only. Connect Firestore to persist data across devices.
    setSavedMessage(`Энэ сессэд ${students.filter(s => s.status).length} сурагчийн ирцийг тэмдэглэлээ.`);
    window.setTimeout(() => setSavedMessage(""), 3500);
  };

  return <main className="app-shell">
    <section className="phone-frame">
      <div className="statusbar"><span>9:41</span><span className="system-icons">▮▮ ◉ ▰</span></div>
      {page === "login" ? <div className="login-page">
        <div className="brand"><div className="brand-icon"><BookOpen size={62} strokeWidth={2.2}/><GraduationCapIcon /></div><h1>Сурагчийн ирц</h1><p>Сургуулийн ирцийн бүртгэлийн систем</p></div>
        <form className="login-form" onSubmit={e => { e.preventDefault(); setPage("grades"); }}>
          <label className="input-wrap"><CircleUserRound size={19}/><input value={username} onChange={e => setUsername(e.target.value)} placeholder="Хэрэглэгчийн нэр" autoComplete="username" /></label>
          <label className="input-wrap"><LockKeyhole size={19}/><input value={password} onChange={e => setPassword(e.target.value)} placeholder="Нууц үг" type={showPassword ? "text" : "password"} autoComplete="current-password"/><button className="icon-button" type="button" onClick={() => setShowPassword(v => !v)} aria-label="Нууц үг харуулах">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></label>
          <button className="primary-btn" type="submit">Нэвтрэх</button>
          <p className="demo-note">Загварын горим: оруулсан мэдээлэл баталгаажихгүй.</p>
        </form>
      </div> : <>
        <header className="topbar">
          <button className="back-button" onClick={goBack} aria-label="Буцах">{page !== "grades" && page !== "profile" ? <ChevronLeft/> : null}</button>
          <h2>{page === "grades" ? "Анги сонгох" : page === "sections" ? `${grade} сонгох` : page === "attendance" ? `${section} ангийн ирц` : page === "history" ? "Ирц харах" : "Профайл"}</h2>
          <button className="avatar" onClick={() => setPage("profile")} aria-label="Профайл"><CircleUserRound size={25}/></button>
        </header>
        {page === "grades" && <div className="list-page">{grades.map((g, i) => <button key={g} className={`select-card ${grade === g ? "selected" : ""}`} onClick={() => { setGrade(g); setPage("sections"); }}><span className="round-icon"><UsersRound/></span><strong>{g}</strong><ChevronRight className="chevron"/></button>)}</div>}
        {page === "sections" && <div className="list-page">{(grade === "6-р анги" ? sections : ["а", "б", "в", "г"]).map((s) => { const label = `${grade.startsWith("6") ? "6" : grade.match(/\d+/)?.[0] ?? "6"}${s.replace(/^\d+/, "")}`; return <button key={s} className="select-card" onClick={() => { setSection(label); setStudents(initialNames.map((name, i) => ({ id: i + 1, name, status: "" }))); setPage("attendance"); }}><span className="round-icon"><UsersRound/></span><strong>{label}</strong><ChevronRight className="chevron"/></button>; })}</div>}
        {page === "attendance" && <div className="attendance-page">
          <div className="toolbar"><label className="date-label">Огноо <input type="date" value={date} onChange={e => setDate(e.target.value)}/></label><label className="search-box"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Нэрээр хайх"/></label></div>
          <div className="summary-grid">{statuses.map(s => <div key={s} className={`summary-chip ${statusClass[s]}`}><span>{s}</span><b>{counts[s]}</b></div>)}</div>
          <div className="table-wrap"><table><thead><tr><th>№</th><th>Сурагчийн нэр</th>{statuses.map(s => <th key={s}>{s}</th>)}</tr></thead><tbody>{filteredStudents.map((s) => <tr key={s.id}><td>{s.id}</td><td className="student-name">{s.name}</td>{statuses.map(st => <td key={st}><button aria-label={`${s.name}: ${st}`} title={st} onClick={() => setStatus(s.id, st)} className={`status-radio ${s.status === st ? `checked ${statusClass[st]}` : ""}`}>{s.status === st ? <Check size={13}/> : null}</button></td>)}</tr>)}</tbody></table></div>
          {savedMessage && <p className="success-message">{savedMessage}</p>}
          <div className="action-row"><button className="save-btn" onClick={saveAttendance}><Save size={19}/>Өгөгдөл хадгалах</button><button className="excel-btn" onClick={exportExcel}><FileSpreadsheet size={20}/>Excel (.xlsx) татах</button></div>
          <p className="hint">Нэг сурагчид нэг төлөв сонгоно. Төлөв дээр дахин дарвал арилна.</p>
        </div>}
        {page === "history" && <div className="empty-state"><CalendarDays size={42}/><h3>Ирцийн түүх</h3><p>Ирц бүртгэсний дараа тайланг Excel файлаар татаж авна.</p><button className="primary-btn" onClick={() => setPage("grades")}>Анги сонгох</button></div>}
        {page === "profile" && <div className="profile-page"><div className="profile-avatar"><CircleUserRound size={48}/></div><h3>{username || "Багшийн хэрэглэгч"}</h3><p>Загварын горим</p><div className="notice">{isFirebaseConfigured ? "Firebase тохиргоо илэрлээ. Нэвтрэлтийн ажиллагааг холбох шаардлагатай." : "Firebase хараахан тохируулаагүй байна."}</div><button className="outline-btn" onClick={() => setPage("login")}><LogOut size={18}/> Гарах</button></div>}
        <nav className="bottom-nav"><button className={page !== "history" ? "active" : ""} onClick={() => setPage("grades")}><Home size={22}/><span>Нүүр хуудас</span></button><button className={page === "history" ? "active" : ""} onClick={() => setPage("history")}><CalendarDays size={22}/><span>Ирц харах</span></button></nav>
      </>}
      <div className="safe-area" />
    </section>
    <aside className="desktop-info"><div className="info-mark"><BookOpen size={36}/></div><p className="eyebrow">STARTER PROJECT</p><h1>Сурагчийн ирц</h1><p>VS Code дээр хөгжүүлэх эхний хувилбар</p><div className="info-card"><h3>Төслийн төлөв</h3><p><span className="dot"/> Интерфэйс ба дэлгэц хоорондын шилжилт бэлэн</p><p><span className={`dot ${isFirebaseConfigured ? "green" : "orange"}`}/> Firebase: {isFirebaseConfigured ? "тохиргоо олдсон" : "холбох шаардлагатай"}</p><p><span className="dot orange"/> Ирц хадгалалт: одоогоор зөвхөн сессийн загвар</p></div><div className="info-card"><h3>Дараагийн алхам</h3><ol><li>Node.js суулгах</li><li>Төслийн хавтсыг VS Code-д нээх</li><li><code>npm install</code> ажиллуулах</li><li><code>npm run dev</code> ажиллуулах</li></ol></div></aside>
  </main>;
}

function GraduationCapIcon() { return <span className="cap-symbol">◆</span>; }
