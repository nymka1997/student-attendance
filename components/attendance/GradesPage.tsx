import { ChevronRight, UsersRound } from "lucide-react";
import { grades } from "@/lib/attendance-data";

export default function GradesPage({ onSelect }: { onSelect: (grade: string) => void }) {
  return <div className="list-page">{grades.map(g => (
    <button key={g} className="select-card" onClick={() => onSelect(g)}>
      <span className="round-icon"><UsersRound /></span><strong>{g}</strong><ChevronRight className="chevron" />
    </button>
  ))}</div>;
}
