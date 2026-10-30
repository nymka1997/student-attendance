
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ClipboardCheck,
  Home,
  Menu,
  Megaphone,
  UsersRound,
  UserRoundPlus,
  CircleUserRound,
  X,
  LogOut,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

import type {
  Page,
  Status,
  Student,
} from "@/lib/attendance-types";
import { FirebaseError } from "firebase/app";
import {
  initialNames,
  statuses,
} from "@/lib/attendance-data";

import LoginPage from "@/components/attendance/LoginPage";
import InstallPage from "@/components/attendance/InstallPage";
import HomeDashboard from "@/components/attendance/HomeDashboard";
import GradesPage from "@/components/attendance/GradesPage";
import SectionsPage from "@/components/attendance/SectionsPage";
import AttendancePage from "@/components/attendance/AttendancePage";
import HistoryPage from "@/components/attendance/HistoryPage";
import LateStudentsPage from "@/components/attendance/LateStudentsPage";

export default function HomePage() {
  const [page, setPage] = useState<Page>("login");
  const [showInstall, setShowInstall] = useState(false);

  const [username, setUsername] = useState("");

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [authChecking, setAuthChecking] = useState(true);

  const [loggingOut, setLoggingOut] = useState(false);

  const [grade, setGrade] = useState("6-р анги");

  const [section, setSection] = useState("6а");

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [search, setSearch] = useState("");

  const [savedMessage, setSavedMessage] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const [students, setStudents] = useState<Student[]>(
    initialNames.map((name, i) => ({
      id: i + 1,
      name,
      status: "",
    }))
  );
const [loginError, setLoginError] = useState("");
  // PWA суулгасан эсэхийг шалгана. Суулгаагүй бол эхлээд суулгах дэлгэц харуулна.
  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setShowInstall(!standalone);
  }, []);

  // Firebase нэвтрэлтийн төлөвийг автоматаар шалгана

useEffect(() => {
  const firebaseAuth = auth;
  const firestore = db;

  if (!firebaseAuth || !firestore) {
    console.error("Firebase тохиргоо олдсонгүй.");
    setAuthChecking(false);
    setCurrentUser(null);
    setPage("login");
    return;
  }

  const unsubscribe = onAuthStateChanged(
    firebaseAuth,
    async (user) => {
      if (!user) {
        setCurrentUser(null);
        setUsername("");
        setPage("login");
        setAuthChecking(false);
        return;
      }

      try {
        const userRef = doc(firestore, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
          await signOut(firebaseAuth);
          setCurrentUser(null);
          setPage("login");
          return;
        }

        const userData = userSnapshot.data();

        if (userData.role !== "teacher") {
          await signOut(firebaseAuth);
          setCurrentUser(null);
          setPage("login");
          return;
        }

        setCurrentUser(user);
        setUsername(
          userData.name || user.displayName || user.email || ""
        );
        setPage("home");
      } catch (error) {
        console.error("Хэрэглэгчийн эрх шалгах алдаа:", error);
        await signOut(firebaseAuth);
        setCurrentUser(null);
        setPage("login");
      } finally {
        setAuthChecking(false);
      }
    }
  );

  return () => unsubscribe();
}, []);

  // Хайлтаар сурагч шүүх
  const filteredStudents = useMemo(
    () =>
      students.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      ),
    [students, search]
  );

  // Ирцийн тоонууд
  const counts = useMemo(
    () =>
      statuses.reduce((acc, status) => {
        acc[status] = students.filter(
          (s) => s.status === status
        ).length;

        return acc;
      }, {} as Record<Status, number>),
    [students]
  );

  // Сурагчийн ирц өөрчлөх
  const setStudentStatus = (
    id: number,
    status: Status
  ) => {
    setStudents((current) =>
      current.map((s) =>
        s.id === id
          ? {
              ...s,
              status: s.status === status ? "" : status,
            }
          : s
      )
    );
  };

  // Excel файл татах
  const exportExcel = () => {
    const rows = students.map((s, i) => ({
      "№": i + 1,
      "Сурагчийн нэр": s.name,
      "Анги": grade,
      "Бүлэг": section,
      "Огноо": date,
      "Ирцийн төлөв": s.status || "Бүртгээгүй",
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);

    const book = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      book,
      sheet,
      "Ирц"
    );

    XLSX.writeFile(
      book,
      `irts-${section}-${date}.xlsx`
    );
  };

  // Ирц хадгалсан мэдэгдэл
  const saveAttendance = () => {
    setSavedMessage(
      `Энэ сессэд ${
        students.filter((s) => s.status).length
      } сурагчийн ирцийг тэмдэглэлээ.`
    );

    window.setTimeout(
      () => setSavedMessage(""),
      3500
    );
  };

  // Хуудас нээх
  const openPage = (target: Page) => {
    setPage(target);
    setMenuOpen(false);
    setProfileOpen(false);
  };

  // Буцах
  const goBack = () => {
    if (page === "attendance") {
      setPage("sections");
    } else if (page === "sections") {
      setPage("grades");
    } else {
      setPage("home");
    }
  };


  const handleLogin = async (password: string) => {
  const firebaseAuth = auth;
  const firestore = db;

  if (!firebaseAuth || !firestore) {
    alert("Firebase тохиргоо олдсонгүй.");
    return;
  }

  const phone = username.replace(/\D/g, "");

  if (!phone || !password) {
    alert("Утасны дугаар болон нууц үгээ оруулна уу.");
    return;
  }

  try {
    const email = `bagsh.${phone}@login.student-attendance.mn`;

    const credential = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );

    const userRef = doc(
      firestore,
      "users",
      credential.user.uid
    );

    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      await signOut(firebaseAuth);
      alert("Хэрэглэгчийн эрхийн мэдээлэл олдсонгүй.");
      return;
    }

    const userData = userSnapshot.data();

    if (userData.role !== "teacher") {
      await signOut(firebaseAuth);
      alert("Энэ системд зөвхөн багшийн эрхээр нэвтэрнэ.");
      return;
    }

    setLoginError("");

    setCurrentUser(credential.user);
    setUsername(userData.name || phone);
    setPage("home");

  } catch (error: unknown) {
  console.error("Нэвтрэх алдаа:", error);

  const code =
    error instanceof FirebaseError ? error.code : "";

  if (
    code === "auth/invalid-credential" ||
    code === "auth/user-not-found" ||
    code === "auth/wrong-password"
  ) {
    setLoginError("Нэвтрэх нэр эсвэл нууц үг буруу байна.");
  } else if (code === "auth/too-many-requests") {
    setLoginError("Олон удаа буруу оролдлоо. Түр хүлээнэ үү.");
  } else {
    setLoginError("Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.");
  }
}
};


  // Firebase-аас гарах
 const handleLogout = async () => {
  try {
    if (auth === null) {
      throw new Error("Firebase Auth тохиргоо байхгүй байна.");
    }

    setLoggingOut(true);
    setMenuOpen(false);
    setProfileOpen(false);

    await signOut(auth);

    setCurrentUser(null);
    setUsername("");
    setPage("login");
    setSavedMessage("");
    setSearch("");
    setLoggingOut(false);
  } catch (error: unknown) {
  console.error("Гарах алдаа:", error);
} finally {
  setLoggingOut(false);
}
};

  // Хуудасны гарчиг
  const pageTitles: Partial<Record<Page, string>> = {
    home: "Нүүр хуудас",
    grades: "Анги сонгох",
    sections: `${grade} сонгох`,
    attendance: `${section} ангийн ирц`,
    history: "Манай ангийн ирц",
    lateStudents: "Хоцорсон сурагч бүртгэх",
    announcements: "Админы зар",
    schedule: "Миний хичээлийн хуваарь",
    classAttendance: "Манай ангийн ирц",
  };

  // Цэс
  const menuItems: {
    label: string;
    icon: typeof Home;
    page: Page;
  }[] = [
    {
      label: "Нүүр хуудас",
      icon: Home,
      page: "home",
    },
    {
      label: "Админы зар",
      icon: Megaphone,
      page: "announcements",
    },
    {
      label: "Миний хичээлийн хуваарь",
      icon: CalendarDays,
      page: "schedule",
    },
    {
      label: "Манай ангийн ирц",
      icon: UsersRound,
      page: "history",
    },
    {
      label: "Хоцорсон сурагч бүртгэх",
      icon: UserRoundPlus,
      page: "lateStudents",
    },
    {
      label: "Ирц бүртгэх",
      icon: ClipboardCheck,
      page: "grades",
    },
  ];

  // Firebase шалгаж байх үед
  if (authChecking) {
    return (
      <main className="app-shell">
        <section className="phone-frame">
          <div
            style={{
              minHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <BookOpen size={36} />
            <p>Нэвтрэлтийг шалгаж байна...</p>
          </div>
        </section>
      </main>
    );
  }

  if (showInstall) {
    return (
      <InstallPage
        onContinue={() => setShowInstall(false)}
      />
    );
  }

  return (
    <main className="app-shell">
      <section className="phone-frame">

        {/* НЭВТРЭХ ХЭСЭГ */}
        {page === "login" ? (
         <LoginPage
  username={username}
  setUsername={setUsername}
  onLogin={handleLogin}
  loginError={loginError}
/>
        ) : (
          <>

            {/* ДЭЭД ЦЭС */}
            <header className="topbar">

              <button
                className="back-button"
                onClick={() => {
                  if (page === "home") {
                    setMenuOpen((v) => !v);
                    setProfileOpen(false);
                  } else {
                    goBack();
                  }
                }}
                aria-label={
                  page === "home"
                    ? "Цэс нээх"
                    : "Буцах"
                }
              >
                {page === "home" ? (
                  menuOpen ? <X /> : <Menu />
                ) : (
                  <ChevronLeft />
                )}
              </button>

              <h2>
                {pageTitles[page] || "Сурагчийн ирц"}
              </h2>

              <button
                type="button"
                aria-label="Профайл нээх"
                onClick={() => {
                  setProfileOpen((current) => !current);
                  setMenuOpen(false);
                }}
                style={{
                  width: 38,
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: 0,
                  borderRadius: 10,
                  background: profileOpen
                    ? "#edf2ff"
                    : "transparent",
                  color: "#0b0b0b",
                  cursor: "pointer",
                }}
              >
                {profileOpen ? (
                  <X size={23} />
                ) : (
                  <CircleUserRound size={25} />
                )}
              </button>

            </header>

            {/* ҮНДСЭН ЦЭС */}
            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 20,
                  top: 70,
                  left: 10,
                  right: 10,
                  background: "#fff",
                  border: "1px solid #e5eaf1",
                  borderRadius: 14,
                  padding: 8,
                  boxShadow: "0 12px 30px #00000018",
                }}
              >
                {menuItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.page}
                      onClick={() => openPage(item.page)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 13,
                        border: 0,
                        borderRadius: 9,
                        background:
                          page === item.page
                            ? "#edf2ff"
                            : "#fff",
                        textAlign: "left",
                        color: "#172033",
                        cursor: "pointer",
                      }}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* НҮҮР ХУУДАС */}
            {page === "home" && (
              <HomeDashboard />
            )}

            {/* АНГИ СОНГОХ */}
            {page === "grades" && (
              <GradesPage
                onSelect={(g) => {
                  setGrade(g);
                  setPage("sections");
                }}
              />
            )}

            {/* БҮЛЭГ СОНГОХ */}
            {page === "sections" && (
              <SectionsPage
                grade={grade}
                onSelect={(s) => {
                  setSection(s);

                  setStudents(
                    initialNames.map((name, i) => ({
                      id: i + 1,
                      name,
                      status: "",
                    }))
                  );

                  setPage("attendance");
                }}
              />
            )}

            {/* ИРЦ БҮРТГЭХ */}
            {page === "attendance" && (
              <AttendancePage
                students={students}
                filteredStudents={filteredStudents}
                date={date}
                setDate={setDate}
                search={search}
                setSearch={setSearch}
                counts={counts}
                setStatus={setStudentStatus}
                savedMessage={savedMessage}
                onSave={saveAttendance}
                onExport={exportExcel}
              />
            )}

            {/* ИРЦИЙН ТҮҮХ */}
            {(page === "history" ||
              page === "classAttendance") && (
              <HistoryPage
                onChooseGrade={() => setPage("grades")}
              />
            )}

            {/* ХОЦОРСОН СУРАГЧ */}
            {page === "lateStudents" && (
              <LateStudentsPage />
            )}

            {/* ХИЧЭЭЛИЙН ХУВААРЬ */}
            {page === "schedule" && (
              <div className="empty-state">
                <CalendarDays size={42} />
                <h3>Миний хичээлийн хуваарь</h3>

                <p>
                  Таны хичээлийн хуваарь энд харагдана.
                </p>

                <p>
                  Хуваарийн өгөгдлийг Firebase эсвэл
                  өөрийн хуваарийн эх үүсвэртэй холбох
                  шаардлагатай.
                </p>
              </div>
            )}

            {/* ПРОФАЙЛ */}
            {profileOpen && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 30,
                  top: 68,
                  right: 10,
                  width: 250,
                  padding: 16,
                  border: "1px solid #e5eaf1",
                  borderRadius: 14,
                  background: "#fff",
                  boxShadow: "0 12px 30px #00000020",
                  color: "#131313",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    paddingBottom: 14,
                    borderBottom: "1px solid #e5eaf1",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: "#eff6ff",
                      color: "#0369a1",
                    }}
                  >
                    <CircleUserRound size={27} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <strong
                      style={{
                        display: "block",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {currentUser?.displayName ||
                        currentUser?.email ||
                        username ||
                        "Хэрэглэгч"}
                    </strong>

                    <small style={{ color: "#667085" }}>
                      Нэвтэрсэн хэрэглэгч
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 12,
                    padding: 12,
                    border: 0,
                    borderRadius: 10,
                    background: "#fff1f2",
                    color: "#be123c",
                    cursor: loggingOut
                      ? "not-allowed"
                      : "pointer",
                    textAlign: "left",
                    opacity: loggingOut ? 0.6 : 1,
                  }}
                >
                  <LogOut size={20} />
                  <span>
                    {loggingOut ? "Гарч байна..." : "Гарах"}
                  </span>
                </button>
              </div>
            )}

            {/* НҮҮРНИЙ ДООД ТОВЧ */}
            {(page === "home" ||
              page === "announcements") && (
              <nav className="bottom-nav">

                <button
                  type="button"
                  onClick={() => openPage("lateStudents")}
                  style={{
                    background: "#fff7ed",
                    color: "#c2410c",
                  }}
                >
                  <UserRoundPlus size={22} />
                  <span>Хоцорсон сурагч бүртгэх</span>
                </button>

                <button
                  type="button"
                  onClick={() => openPage("grades")}
                  style={{
                    background: "#16a34a",
                    color: "#fff",
                  }}
                >
                  <ClipboardCheck size={22} />
                  <span>Ирц бүртгэх</span>
                </button>

              </nav>
            )}

          </>
        )}

        <div className="safe-area" />

      </section>

      {/* DESKTOP ТАЛЫН МЭДЭЭЛЭЛ */}
      <aside className="desktop-info">

        <div className="info-mark">
          <BookOpen size={36} />
        </div>

        <p className="eyebrow">
          STUDENT ATTENDANCE
        </p>

        <h1>Сурагчийн ирц</h1>

        <p>
          Сургуулийн ирцийн бүртгэлийн систем
        </p>

        <div className="info-card">
          <h3>Үндсэн үйлдлүүд</h3>

          <p>
            <span className="dot" />
            Нүүр хуудас болон цэс
          </p>

          <p>
            <span className="dot" />
            Ирц бүртгэх, Excel татах
          </p>

          <p>
            <span className="dot" />
            Хоцорсон сурагч бүртгэх
          </p>
        </div>

      </aside>

    </main>
  );
}
