import { Check, FileSpreadsheet, Save, Search } from "lucide-react";
import type { Status, Student } from "@/lib/attendance-types";
import { statuses, statusClass } from "@/lib/attendance-data";

export default function AttendancePage(props: {
  students: Student[]; filteredStudents: Student[]; date: string; setDate: (v: string) => void;
  search: string; setSearch: (v: string) => void; counts: Record<Status, number>;
  setStatus: (id: number, status: Status) => void; savedMessage: string;
  onSave: () => void; onExport: () => void;
}) {
  const { students, filteredStudents, date, setDate, search, setSearch, counts, setStatus, savedMessage, onSave, onExport } = props;
  return <div className="attendance-page">
    <div className="toolbar">
      <label className="date-label">Огноо<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
      <label className="search-box"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Нэрээр хайх" /></label>
    </div>
    <div className="summary-grid">{statuses.map(s => <div key={s} className={`summary-chip ${statusClass[s]}`}><span>{s}</span><b>{counts[s]}</b></div>)}</div>
    <div className="table-wrap"><table><thead><tr><th>№</th><th>Сурагчийн нэр</th>{statuses.map(s => <th key={s}>{s}</th>)}</tr></thead>
      <tbody>{filteredStudents.map(s => <tr key={s.id}><td>{s.id}</td><td className="student-name">{s.name}</td>{statuses.map(st => <td key={st}>
        <button aria-label={`${s.name}: ${st}`} title={st} onClick={() => setStatus(s.id, st)} className={`status-radio ${s.status === st ? `checked ${statusClass[st]}` : ""}`}>
          {s.status === st ? <Check size={13} /> : null}
        </button></td>)}</tr>)}</tbody></table></div>
    {savedMessage && <p className="success-message">{savedMessage}</p>}
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
    <p className="hint">Нэг сурагчид нэг төлөв сонгоно. Төлөв дээр дахин дарвал арилна.</p>
  </div>;
}
