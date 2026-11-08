
"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Search, Users } from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type AttendanceStudent = {
  id: string;
  name: string;
  status: string;
};

type AttendanceRecord = {
  id: string;
  grade: string;
  section: string;
  date: string;
  teacherName: string;
  students: AttendanceStudent[];
};

const statusList = [
  "Ирсэн",
  "Өвчтэй",
  "Чөлөөтэй",
  "Тасалсан",
];

function localDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStartDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - (days - 1));
  return localDate(date);
}

export default function HistoryPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedGrade, setSelectedGrade] = useState("Бүгд");
  const [selectedSection, setSelectedSection] = useState("Бүгд");
  const [selectedDate, setSelectedDate] = useState("");
  const [search, setSearch] = useState("");

  const [startDate] = useState(() => getStartDate(7));
  const [today] = useState(() => localDate(new Date()));

  useEffect(() => {
    let cancelled = false;

    async function loadAttendance() {
      if (!db) {
        setError("Firebase холболт олдсонгүй.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const constraints: QueryConstraint[] = [];

        if (selectedDate) {
          constraints.push(where("date", "==", selectedDate));
        } else {
          constraints.push(where("date", ">=", startDate));
          constraints.push(where("date", "<=", today));
        }

        if (selectedGrade !== "Бүгд") {
          constraints.push(
            where("grade", "==", selectedGrade)
          );
        }

        if (selectedSection !== "Бүгд") {
          constraints.push(
            where("section", "==", selectedSection)
          );
        }

        const attendanceQuery = query(
          collection(db, "attendance"),
          ...constraints
        );

        const snapshot = await getDocs(attendanceQuery);

        if (cancelled) return;

        const result: AttendanceRecord[] = snapshot.docs.map(
          (item) => {
            const data = item.data();

            return {
              id: item.id,
              grade: String(data.grade ?? ""),
              section: String(data.section ?? ""),
              date: String(data.date ?? ""),
              teacherName: String(data.teacherName ?? ""),
              students: Array.isArray(data.students)
                ? data.students.map(
                    (student: AttendanceStudent) => ({
                      id: String(student.id ?? ""),
                      name: String(student.name ?? ""),
                      status: String(student.status ?? ""),
                    })
                  )
                : [],
            };
          }
        );

        result.sort((a, b) =>
          b.date.localeCompare(a.date)
        );

        setRecords(result);
      } catch (err) {
        console.error("Ирц татах алдаа:", err);

        if (!cancelled) {
          setError(
            "Ирц татаж чадсангүй. Firebase эрх эсвэл индексийг шалгана уу."
          );
          setRecords([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAttendance();

    return () => {
      cancelled = true;
    };
  }, [
    selectedDate,
    selectedGrade,
    selectedSection,
    startDate,
    today,
  ]);

  const grades = Array.from(
    { length: 12 },
    (_, i) => String(i + 1)
  );

  const sections = [
    "А", "Б", "В", "Г", "Д", "Е", "Ё",
    "Ж", "З", "И", "Й", "К", "Л",
    "М", "Н", "О", "Ө", "П", "Р",
    "С", "Т", "У", "Ү", "Ф",
    "Х", "Ц", "Ч", "Ш",
  ];

  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return records;

    return records.filter((record) =>
      record.students.some((student) =>
        student.name.toLowerCase().includes(keyword)
      )
    );
  }, [records, search]);

  const totalCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Ирсэн: 0,
      Өвчтэй: 0,
      Чөлөөтэй: 0,
      Тасалсан: 0,
    };

    filteredRecords.forEach((record) => {
      record.students.forEach((student) => {
        if (student.status in counts) {
          counts[student.status]++;
        }
      });
    });

    return counts;
  }, [filteredRecords]);

  return (
    <div className="history-page">
      <div className="history-heading">
        <div>
          <h3>Сургуулийн ирцийн бүртгэл</h3>
          <p>
            {selectedDate
              ? `${selectedDate} өдрийн ирц`
              : "Сүүлийн 7 хоногийн ирц"}
          </p>
        </div>
        <CalendarDays size={28} />
      </div>

      <div className="history-filters">
        <label>
          Анги
          <select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              setSelectedSection("Бүгд");
            }}
          >
            <option value="Бүгд">Бүх анги</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}-р анги
              </option>
            ))}
          </select>
        </label>

        <label>
          Бүлэг
          <select
            value={selectedSection}
            onChange={(e) =>
              setSelectedSection(e.target.value)
            }
          >
            <option value="Бүгд">Бүх бүлэг</option>
            {sections.map((section) => (
              <option key={section} value={section}>
                {section} бүлэг
              </option>
            ))}
          </select>
        </label>

        <label>
          Огноо
          <input
            type="date"
            value={selectedDate}
            onChange={(e) =>
              setSelectedDate(e.target.value)
            }
          />
        </label>

        {selectedDate && (
          <button
            type="button"
            onClick={() => setSelectedDate("")}
          >
            Сүүлийн 7 хоног
          </button>
        )}

        <label>
          Сурагч хайх
          <div className="history-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Нэрээр хайх..."
            />
          </div>
        </label>
      </div>

      {loading ? (
        <p className="history-message">
          Ирцийн мэдээлэл татаж байна...
        </p>
      ) : error ? (
        <p className="history-message">{error}</p>
      ) : (
        <>
          <div className="history-summary">
            <div>
              <Users size={19} />
              <span>Нийт ирсэн</span>
              <strong>{totalCounts["Ирсэн"]}</strong>
            </div>

            <div>
              <span>Өвчтэй</span>
              <strong>{totalCounts["Өвчтэй"]}</strong>
            </div>

            <div>
              <span>Чөлөөтэй</span>
              <strong>{totalCounts["Чөлөөтэй"]}</strong>
            </div>

            <div>
              <span>Тасалсан</span>
              <strong>{totalCounts["Тасалсан"]}</strong>
            </div>
          </div>

          <div className="history-records">
            {filteredRecords.length === 0 ? (
              <p className="history-message">
                Сонгосон нөхцөлд тохирох ирцийн мэдээлэл алга.
              </p>
            ) : (
              filteredRecords.map((record) => (
                <details
                  key={record.id}
                  className="history-record"
                >
                  <summary>
                    <div>
                      <strong>
                        {record.grade}-р анги ·{" "}
                        {record.section}
                      </strong>
                      <span>{record.date}</span>
                    </div>

                    <div className="history-record-info">
                      <span>
                        <Users size={15} />
                        {record.students.length} сурагч
                      </span>
                      <span>{record.teacherName}</span>
                    </div>
                  </summary>

                  <div className="history-students">
                    {record.students
                      .filter((student) =>
                        student.name
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      )
                      .map((student, index) => (
                        <div
                          key={`${student.id}-${index}`}
                          className="history-student"
                        >
                          <span>
                            {index + 1}. {student.name}
                          </span>

                          <span
                            className={`history-status status-${statusList.indexOf(student.status)}`}
                          >
                            {student.status ||
                              "Бүртгээгүй"}
                          </span>
                        </div>
                      ))}
                  </div>
                </details>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
