import { CircleUserRound, LogOut } from "lucide-react";

export default function ProfilePage({ username, firebaseConfigured, onLogout }: {
  username: string; firebaseConfigured: boolean; onLogout: () => void;
}) {
  return <div className="profile-page">
    <div className="profile-avatar"><CircleUserRound size={48} /></div>
    <h3>{username || "Багшийн хэрэглэгч"}</h3><p>Загварын горим</p>
    <div className="notice">{firebaseConfigured
      ? "Firebase тохиргоо илэрлээ. Нэвтрэлтийн ажиллагааг холбох шаардлагатай."
      : "Firebase хараахан тохируулаагүй байна."}</div>
    <button className="outline-btn" onClick={onLogout}><LogOut size={18} /> Гарах</button>
  </div>;
}
