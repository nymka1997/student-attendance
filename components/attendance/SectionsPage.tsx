import { ChevronRight, UsersRound } from "lucide-react";
import { sections } from "@/lib/attendance-data";

export default function SectionsPage({ grade, onSelect }: { grade: string; onSelect: (section: string) => void }) {
  const sectionLetters = grade === "6-р анги" ? sections : ["а", "б", "в", "г"];
  const gradeNumber = grade.match(/\d+/)?.[0] ?? "6";
  return <div className="list-page">{sectionLetters.map(s => {
    const label = `${gradeNumber}${s.replace(/^\d+/, "")}`;
    return <button key={label} className="select-card" onClick={() => onSelect(label)}>
      <span className="round-icon"><UsersRound /></span><strong>{label}</strong><ChevronRight className="chevron" />
    </button>;
  })}</div>;
}
