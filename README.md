# Сурагчийн ирц — Next.js + TypeScript + Firebase

Энэ төсөл нь гар утас/компьютерт тохирсон ирцийн аппын эхний хувилбар бөгөөд PWA manifest-тэй. HTTPS хаяг дээр нээхэд дэмждэг браузерын цэснээс үндсэн дэлгэцэд нэмэх боломжтой. Одоогоор offline ажиллагаа байхгүй.

## Windows / VS Code дээр ажиллуулах

1. Node.js LTS суулгана: https://nodejs.org/
2. VS Code дээр энэ хавтсыг нээнэ.
3. Terminal → New Terminal нээгээд:

```powershell
npm.cmd install
npm.cmd run dev
```

4. Браузер дээр http://localhost:3000 нээнэ.

## Vercel-д байршуулах

### GitHub-аар (зөвлөмжтэй)
1. https://github.com дээр нэвтэрч шинэ repository үүсгэнэ.
2. Төслийн бүх файлыг repository руу upload хийнэ. `node_modules` хавтас оруулах хэрэггүй.
3. https://vercel.com дээр GitHub-аар нэвтэрнэ.
4. **Add New → Project** сонгоод repository-г импортлоно.
5. Framework нь Next.js гэж автоматаар танигдана. Build command `npm run build`, output тохиргоог анхдагчаар үлдээнэ.
6. Firebase тохируулах бол Project Settings → Environment Variables хэсэгт `.env.local` дахь `NEXT_PUBLIC_FIREBASE_...` утгуудыг нэмээд дахин Deploy хийнэ.

### Firebase-ийн анхааруулга
- Нэвтрэх хэсэг одоогоор demo горимд байна; жинхэнэ нууц үг баталгаажуулахгүй.
- Ирц хадгалах үйлдэл одоогоор зөвхөн тухайн хуудасны session-д мессеж харуулна; Firestore-д хадгалахгүй.
- Бодит сурагчийн мэдээлэл оруулахаас өмнө Firebase Authentication, Firestore, эрхийн шалгалт болон хамгаалалтын дүрмийг тохируулна.
- `.env.local` болон нууц утгуудыг GitHub-д бүү оруул.

## Утасанд апп болгон нэмэх

Vercel дээр HTTPS хаяг авсны дараа утасны браузераар нээнэ.
- Android/Chrome: browser menu → **Install app** эсвэл **Add to Home screen**.
- iPhone/Safari: **Share** → **Add to Home Screen**.

Энэ нь PWA хэлбэрээр үндсэн дэлгэцэд нэмнэ; Play Store/App Store-д нийтэлсэн native апп биш.
