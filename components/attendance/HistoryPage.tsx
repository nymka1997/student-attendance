import { CalendarDays } from "lucide-react";

export default function HistoryPage({ onChooseGrade }: { onChooseGrade: () => void }) {
  return <div className="empty-state">
    <CalendarDays size={42} /><h3>Ирцийн түүх</h3>
    <p>Ирц бүртгэсний дараа тайланг Excel файлаар татаж авна.</p>
    <button className="primary-btn" onClick={onChooseGrade}>Анги сонгох</button>
  </div>;
}
