
import { Check, Save, Search, UserRound, MapPin, Phone, Users, DoorOpen } from "lucide-react";
import type { Status, Student } from "@/lib/attendance-types";
import { statuses, statusClass } from "@/lib/attendance-data";

type ClassInfo = {
  teacher: string;
  teacherPhone: string;
  count: number;
  building: string;
  classRoom: string;
  shift: string;
};

export default function AttendancePage(props: {
  students: Student[];
  filteredStudents: Student[];
  date: string;
  setDate: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  counts: Record<Status, number>;
  setStatus: (id: string, status: Status) => void;
  setAllStatus: (status: Status) => void;
  savedMessage: string;
  onSave: () => void;
  classInfo: ClassInfo | null;
  classInfoLoading: boolean;
}) {
  const {
    filteredStudents,
    date,
    setDate,
    search,
    setSearch,
    counts,
    setStatus,
    setAllStatus,
    savedMessage,
    onSave,
    classInfo,
    classInfoLoading,
  } = props;

  return (
    <div className="attendance-page">
 

 <label className="date-label">
          Огноо
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </label>



      {/* АНГИЙН МЭДЭЭЛЭЛ */}
      <div className="attendance-class-card">

        <div className="attendance-class-header">
          <h3>Ангийн мэдээлэл</h3>
          <span className="shift-badge">
            {classInfoLoading
              ? "Уншиж байна..."
              : classInfo?.shift || "Ээлж бүртгэлгүй"}
          </span>
        </div>

        {classInfoLoading ? (
          <p className="class-loading">
            Ангийн мэдээлэл татаж байна...
          </p>
        ) : (
          <>
            <div className="attendance-class-teacher">
              <UserRound size={20} />
              <div>
                <span>Анги удирдсан багш</span>
                <strong>
                  {classInfo?.teacher || "Бүртгэлгүй"}
                </strong>
              </div>
            </div>

            <div className="attendance-class-grid">

              <div>
                <Users size={17} />
                <span>Сурагчдын тоо</span>
                <strong>{classInfo?.count ?? 0}</strong>
              </div>

              <div>
                <Phone size={17} />
                <span>Багшийн утас</span>
                <strong>
                  {classInfo?.teacherPhone || "Бүртгэлгүй"}
                </strong>
              </div>

              <div>
                <MapPin size={17} />
                <span>Хичээл орох байр</span>
                <strong>
                  {classInfo?.building || "Бүртгэлгүй"}
                </strong>
              </div>

              <div>
                <DoorOpen size={17} />
                <span>Тоот</span>
                <strong>
                  {classInfo?.classRoom || "Бүртгэлгүй"}
                </strong>
              </div>

            </div>
          </>
        )}
      </div>

      {/* ОГНОО БОЛОН ХАЙЛТ */}
      <div className="toolbar">
        <label className="search-box">
          <Search size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Нэрээр хайх"
          />
        </label>
      </div>

      {/* ИРЦИЙН НЭГТГЭЛ */}
      <div className="summary-grid">
        {statuses.map(s => (
          <div
            key={s}
            className={`summary-chip ${statusClass[s]}`}
          >
            <span>{s}</span>
            <b>{counts[s]}</b>
          </div>
        ))}
      </div>

      {/* БҮГДИЙГ СОНГОХ */}
      <div className="bulk-section">
        <p className="bulk-title">Бүгдийг сонгох</p>

        <div className="bulk-actions">
          {statuses.map(status => (
            <button
              key={status}
              type="button"
              className={`bulk-status-btn ${statusClass[status]}`}
              onClick={() => setAllStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* СУРАГЧДЫН ИРЦИЙН ХҮСНЭГТ */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Сурагчийн нэр</th>
              {statuses.map(s => (
                <th key={s}>{s}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((s, index) => (
              <tr key={s.id}>
                <td>{index + 1}</td>

                <td className="student-name">
                  {s.name}
                </td>

                {statuses.map(st => (
                  <td key={st}>
                    <button
                      aria-label={`${s.name}: ${st}`}
                      title={st}
                      onClick={() => setStatus(s.id, st)}
                      className={`status-radio ${
                        s.status === st
                          ? `checked ${statusClass[st]}`
                          : ""
                      }`}
                    >
                      {s.status === st ? (
                        <Check size={13} />
                      ) : null}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ХАДГАЛСАН МЭДЭГДЭЛ */}
      {savedMessage && (
        <p className="success-message">
          {savedMessage}
        </p>
      )}

      {/* ХАДГАЛАХ */}
      <div className="action-row">
        <div className="save-bar">
          <button
            type="button"
            className="save-btn"
            onClick={onSave}
          >
            <Save size={19} />
            Хадгалах
          </button>
        </div>
      </div>

      <p className="hint">
        Нэг сурагчид нэг төлөв сонгоно.
        Төлөв дээр дахин дарвал арилна.
      </p>

    </div>
  );
}
