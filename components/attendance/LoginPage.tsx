import { useState } from "react";
import { CircleUserRound, LockKeyhole, Eye, EyeOff, } from "lucide-react";

export default function LoginPage({
  username, setUsername, onLogin,loginError
}: { username: string; loginError: string; setUsername: (v: string) => void; onLogin: (password: string) => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="login-page">
      <div className="brand">
        <div className="brand-icon"><img src="/icon.svg" alt="Сургуулийн лого" className="school-logo" /></div>
        <h1>Сурагчийн ирц</h1>
        <p>Сургуулийн ирцийн бүртгэлийн систем</p>
      </div>
      <form className="login-form" onSubmit={(e) => { e.preventDefault(); onLogin(password); }}>
        <label className="input-wrap"><CircleUserRound size={19} />
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Хэрэглэгчийн нэр" autoComplete="username" />
        </label>
        <label className="input-wrap"><LockKeyhole size={19} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Нууц үг" type={showPassword ? "text" : "password"} autoComplete="current-password" />
          <button className="icon-button" type="button" onClick={() => setShowPassword(v => !v)} aria-label="Нууц үг харуулах">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </label>
        {loginError && (
  <div className="login-error">
    {loginError}
  </div>
)}
        <button className="primary-btn" type="submit">Нэвтрэх</button>
        <p className="demo-note">Загварын горим: оруулсан мэдээлэл баталгаажихгүй.</p>
      </form>
    </div>
  );
}
