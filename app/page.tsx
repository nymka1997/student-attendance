
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
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
  type Firestore,
} from "firebase/firestore";



import { auth, db } from "@/lib/firebase";

import type {
  Page,
  Status,
  Student,
} from "@/lib/attendance-types";
import { FirebaseError } from "firebase/app";
import { statuses } from "@/lib/attendance-data";

import LoginPage from "@/components/attendance/LoginPage";
import InstallPage from "@/components/attendance/InstallPage";
import HomeDashboard from "@/components/attendance/HomeDashboard";
import GradesPage from "@/components/attendance/GradesPage";
import SectionsPage from "@/components/attendance/SectionsPage";
import AttendancePage from "@/components/attendance/AttendancePage";
import HistoryPage from "@/components/attendance/HistoryPage";
import LateStudentsPage from "@/components/attendance/LateStudentsPage";
type DutyAssignment = {
  id: string;
  date: string;
  building: string;
  shift: "Өглөө" | "Өдөр";
  teacher1Id: string;
  teacher1Name: string;
  teacher2Id: string;
  teacher2Name: string;
};
type ClassInfo = {
  id: string;
  grade: string;
  section: string;
  teacher: string;
  teacherPhone: string;
  count: number;
  building: string;
  classRoom: string;
  shift: string;
}; 

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
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dutyAssignments, setDutyAssignments] =
  useState<DutyAssignment[]>([]);

const [dutyLoading, setDutyLoading] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const [classInfos, setClassInfos] = useState<ClassInfo[]>([]);
const [classesLoading, setClassesLoading] = useState(false);



 const [students, setStudents] = useState<Student[]>([]);
const [loginError, setLoginError] = useState("");
  // PWA суулгасан эсэхийг шалгана. Суулгаагүй бол эхлээд суулгах дэлгэц харуулна.
  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setShowInstall(!standalone);
  }, []);

useEffect(() => {
  if (!db || !currentUser) {
    setDutyAssignments([]);
    return;
  }

  let cancelled = false;

  async function loadDuty() {
    setDutyLoading(true);

    try {
      const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ulaanbaatar",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      const dutiesRef = collection(db!, "dutyAssignments");

      const [first, second] = await Promise.all([
        getDocs(
          query(
            dutiesRef,
            where("date", "==", today),
            where("teacher1Id", "==", currentUser!.uid)
          )
        ),

        getDocs(
          query(
            dutiesRef,
            where("date", "==", today),
            where("teacher2Id", "==", currentUser!.uid)
          )
        ),
      ]);

      // FIREBASE ШАЛГАЛТ
      console.log("===== ЖИЖҮҮРИЙН ШАЛГАЛТ =====");
      console.log("Өнөөдрийн огноо:", today);
      console.log("Багшийн UID:", currentUser!.uid);

      console.log(
        "Teacher1:",
        first.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );

      console.log(
        "Teacher2:",
        second.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );

      console.log("Нийт хуваарь:", first.size + second.size);

      if (cancelled) return;

      const unique = new Map<string, DutyAssignment>();

      [...first.docs, ...second.docs].forEach((item) => {
        unique.set(item.id, {
          id: item.id,
          ...item.data(),
        } as DutyAssignment);
      });

      setDutyAssignments(Array.from(unique.values()));

    } catch (error) {
      console.error("Жижүүрийн хуваарь татах алдаа:", error);
      setDutyAssignments([]);
    } finally {
      if (!cancelled) {
        setDutyLoading(false);
      }
    }
  }

  void loadDuty();

  return () => {
    cancelled = true;
  };
}, [currentUser]);


// Өнөөдөр жижүүрээр томилогдсон эсэх
const isDutyTeacher = dutyAssignments.length > 0;


// Firestore-оос сонгосон ангийн мэдээлэл татах
useEffect(() => {
  const firestore = db;

  if (!firestore || page !== "sections") {
    return;
  }

  let cancelled = false;

  async function loadClasses() {
    setClassesLoading(true);

    try {
      const gradeValue = grade.match(/\d+/)?.[0] || "";

      const classesQuery = query(
        collection(firestore!, "classes"),
        where("grade", "==", gradeValue)
      );

      const snapshot = await getDocs(classesQuery);

      if (cancelled) return;

      const result: ClassInfo[] = snapshot.docs.map((item) => {
        const data = item.data();

        return {
          id: item.id,
          grade: String(data.grade || ""),
          section: String(data.section || ""),
          teacher: String(data.teacher || ""),
          teacherPhone: String(data.teacherPhone || ""),
          count: Number(data.count || 0),
          building: String(data.building || ""),
          classRoom: String(data.classRoom || ""),
          shift: String(data.shift || ""),
        };
      });

      setClassInfos(result);

    } catch (error) {
      console.error("Ангийн мэдээлэл татах алдаа:", error);
      setClassInfos([]);
    } finally {
      if (!cancelled) {
        setClassesLoading(false);
      }
    }
  }

  void loadClasses();

  return () => {
    cancelled = true;
  };
}, [page, grade]);

const setAllStatus = (status: Status) => {
  setStudents(prev =>
    prev.map(student => ({
      ...student,
      status,
    }))
  );
};

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
      // teachers цуглуулгаас UID-аар багш хайна
      const teacherQuery = query(
        collection(firestore, "teachers"),
        where("uid", "==", user.uid)
      );

      const teacherSnapshot = await getDocs(teacherQuery);

      if (teacherSnapshot.empty) {
        console.error("Багш олдсонгүй. UID:", user.uid);

        await signOut(firebaseAuth);
        setCurrentUser(null);
        setUsername("");
        setPage("login");
        return;
      }

      const teacherData = teacherSnapshot.docs[0].data();

      if (teacherData.role !== "teacher") {
        await signOut(firebaseAuth);
        setCurrentUser(null);
        setUsername("");
        setPage("login");
        return;
      }

      setCurrentUser(user);
      setUsername(
        teacherData.name || user.displayName || user.email || ""
      );
      setPage("home");

    } catch (error) {
      console.error("Багшийн эрх шалгах алдаа:", error);

      await signOut(firebaseAuth);
      setCurrentUser(null);
      setUsername("");
      setPage("login");

    } finally {
      setAuthChecking(false);
    }
  }
);


  return () => unsubscribe();
}, []);
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        console.log("PWA Service Worker бүртгэгдлээ.");
      })
      .catch((error) => {
        console.error("Service Worker алдаа:", error);
      });
  }
}, []);

// Firebase-ээс бодит сурагч болон хадгалсан ирц татах
useEffect(() => {
  const firestore = db;

  if (!firestore || page !== "attendance" || !currentUser) {
    return;
  }

  // Null шалгалтын дараа баталгаатай Firestore instance
  const firestoreDb: Firestore = firestore;
  const uid = currentUser.uid;
  let cancelled = false;

  async function loadAttendance() {
    setAttendanceLoading(true);
    setSavedMessage("");

    try {
      // "6-р анги" гэсэн утгаас "6"-г ялгаж авна.
      const gradeValue = grade.match(/\d+/)?.[0] || "";

      // "6а" эсвэл "А" гэсэн утгаас бүлгийн үсгийг ялгана.
      const sectionValue =
        section.match(/[А-Яа-яЁёӨөҮү]$/)?.[0]?.toLocaleUpperCase("mn-MN") || "";
      const studentsQuery = query(
  collection(firestoreDb, "students"),
  where("grade", "==", gradeValue),
  where("section", "==", sectionValue)
);

const studentSnapshot = await getDocs(studentsQuery);

      
      if (cancelled) return;

      const realStudents: Student[] = studentSnapshot.docs
  .filter((item) => {
    const data = item.data();

    return String(data.section || "")
      .trim()
      .toLocaleUpperCase("mn-MN") === sectionValue;
  })
  .map((item) => {
    const data = item.data();

    return {
      id: String(data.id || item.id),
      name: String(data.name || ""),
      status: "Ирсэн" as Status,
    };
  })
  .filter((student) => student.name.length > 0);

      const attendanceId = `${uid}_${section}_${date}`;
      const attendanceRef = doc(firestoreDb, "attendance", attendanceId);
      const attendanceSnapshot = await getDoc(attendanceRef);

      if (cancelled) return;

      if (attendanceSnapshot.exists()) {
        const savedData = attendanceSnapshot.data();
        const savedStudents = Array.isArray(savedData.students)
          ? (savedData.students as Student[])
          : [];

        const mergedStudents: Student[] = realStudents.map((student) => {
          const saved = savedStudents.find(
            (item) => String(item.id) === student.id
          );

          return {
            ...student,
            status:
              saved && statuses.includes(saved.status as Status)
                ? (saved.status as Status)
                : "",
          };
        });

        setStudents(mergedStudents);
      } else {
        setStudents(realStudents);
      }
    } catch (error) {
      console.error("Ирц болон сурагч татах алдаа:", error);
      setStudents([]);
      setSavedMessage("Сурагчдын мэдээлэл татахад алдаа гарлаа.");
    } finally {
      if (!cancelled) {
        setAttendanceLoading(false);
      }
    }
  }

  void loadAttendance();

  return () => {
    cancelled = true;
  };
}, [page, currentUser, section, date, grade]);


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
    id: string,
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


  // Ирц хадгалсан мэдэгдэл
 
const saveAttendance = async () => {
  const firestore = db;
  const user = currentUser;

  if (!firestore || !user) {
    setSavedMessage("Firebase холболт эсвэл хэрэглэгчийн мэдээлэл олдсонгүй.");
    return;
  }

  if (attendanceLoading) {
    setSavedMessage("Сурагчдын мэдээлэл ачаалж байна. Түр хүлээнэ үү.");
    return;
  }

  if (students.length === 0) {
    setSavedMessage("Хадгалах сурагч олдсонгүй. Анги, бүлгийн сонголтоо шалгана уу.");
    return;
  }

  try {
    const attendanceId = `${user.uid}_${section}_${date}`;
    const attendanceRef = doc(firestore, "attendance", attendanceId);
    await setDoc(
      attendanceRef,
      {
        teacherUid: user.uid,
        teacherName: username,
        grade,
        section,
        date,
        students: students.map((student) => ({
          id: student.id,
          name: student.name,
          status: student.status,
        })),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setSavedMessage(
      `${students.filter((student) => student.status !== "").length} сурагчийн ирцийг Firebase-д хадгаллаа.`
    );
  } catch (error) {
    console.error("Ирц хадгалах алдаа:", error);
    setSavedMessage("Ирц хадгалахад алдаа гарлаа. Firebase Rules болон интернет холболтоо шалгана уу.");
  }
};

  // Хуудас нээх// Хуудас нээх
const openPage = (target: Page) => {
  // Жижүүр биш багш ирц болон хоцролтын хэсэгт орохгүй
  if (
    (target === "grades" || target === "lateStudents") &&
    !isDutyTeacher
  ) {
    return;
  }

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


const selectedClassInfo = classInfos.find((item) => {
  const gradeValue = grade.match(/\d+/)?.[0] || "";

  const sectionValue =
    section.match(/[А-Яа-яЁёӨөҮү]$/)?.[0]
      ?.toLocaleUpperCase("mn-MN") || "";

  return (
    item.grade.trim() === gradeValue &&
    item.section.trim().toLocaleUpperCase("mn-MN") === sectionValue
  );
}) ?? null;

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

    // teachers цуглуулгаас UID талбараар багш хайна
    const teacherQuery = query(
      collection(firestore, "teachers"),
      where("uid", "==", credential.user.uid)
    );

    const teacherSnapshot = await getDocs(teacherQuery);

    if (teacherSnapshot.empty) {
      await signOut(firebaseAuth);
      setLoginError("Багшийн мэдээлэл олдсонгүй.");
      return;
    }

    const teacherData = teacherSnapshot.docs[0].data();

    if (teacherData.role !== "teacher") {
      await signOut(firebaseAuth);
      setLoginError("Энэ системд зөвхөн багшийн эрхээр нэвтэрнэ.");
      return;
    }

    setLoginError("");
    setCurrentUser(credential.user);
    setUsername(teacherData.name || phone);
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
    home: "  ",
    grades: "Анги сонгох",
    sections: `${grade} сонгох`,
    attendance: `${section} ангийн ирц`,
    history: "  ",
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
    },{
  label: "Ирц харах",
  icon: CalendarDays,
  page: "history",
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
              >{menuItems.map((item) => {
  const Icon = item.icon;

  const dutyOnly =
    item.page === "grades" ||
    item.page === "lateStudents";

  const disabled =
    dutyOnly && (dutyLoading || !isDutyTeacher);

  return (
    <button
      key={item.page}
      disabled={disabled}
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
          page === item.page ? "#edf2ff" : "#fff",
        textAlign: "left",
        color: disabled ? "#a0a0a0" : "#172033",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Icon size={20} />
      <span>{item.label}</span>

      {dutyOnly && (
        <span style={{ marginLeft: "auto", fontSize: 11 }}>
          {dutyLoading
            ? "Шалгаж байна..."
            : isDutyTeacher
              ? "Идэвхтэй"
              : "Жижүүр биш"}
        </span>
      )}
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
                onSelect={(s) => {
                  setGrade(s);
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
      setStudents([]);
      setPage("attendance");
    }}
  />
)}

            {/* ИРЦ БҮРТГЭХ */}
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
    setAllStatus={setAllStatus}
    savedMessage={savedMessage}
    onSave={saveAttendance}
    classInfo={selectedClassInfo}
    classInfoLoading={classesLoading}
  />
)}
            {/* ИРЦИЙН ТҮҮХ */}
           {/* ИРЦИЙН ТҮҮХ */}
{(page === "history" ||
  page === "classAttendance") && (
  <HistoryPage />
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

               {/* ХОЦОРСОН СУРАГЧ */}
<button
  type="button"
  disabled={dutyLoading || !isDutyTeacher}
  onClick={() => openPage("lateStudents")}
  style={{
  background: isDutyTeacher ? "#fff7ed" : "#f8f5f1",
  color: isDutyTeacher ? "#c2410c" : "#b8aaa0",
  opacity: 1,
  cursor: isDutyTeacher ? "pointer" : "not-allowed",
  transition: "all 0.3s ease",
  boxShadow: isDutyTeacher
    ? "0 4px 12px rgba(194,65,12,0.10)"
    : "none",
  transform: isDutyTeacher ? "translateY(0)" : "scale(0.99)",
  border: isDutyTeacher
    ? "1px solid #fed7aa"
    : "1px solid #eee9e3",
}}
>
  <UserRoundPlus size={22} />
  <span>Хоцорсон сурагч бүртгэх</span>
</button>

{/* ИРЦ БҮРТГЭХ */}
<button
  type="button"
  disabled={dutyLoading || !isDutyTeacher}
  onClick={() => openPage("grades")}
  style={{
  background: isDutyTeacher ? "#fff7ed" : "#f8f5f1",
  color: isDutyTeacher ? "#c2410c" : "#b8aaa0",
  opacity: 1,
  cursor: isDutyTeacher ? "pointer" : "not-allowed",
  transition: "all 0.3s ease",
  boxShadow: isDutyTeacher
    ? "0 4px 12px rgba(194,65,12,0.10)"
    : "none",
  transform: isDutyTeacher ? "translateY(0)" : "scale(0.99)",
  border: isDutyTeacher
    ? "1px solid #fed7aa"
    : "1px solid #eee9e3",
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
            Ирц бүртгэх, хадгалах
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
