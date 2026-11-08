export type Status = "Ирсэн" | "Өвчтэй" | "Чөлөөтэй" | "Тасалсан";
export type Student = { id: string; name: string; status: Status | "" };
export type Page =
  | "install"
  | "login"
  | "home"
  | "grades"
  | "sections"
  | "attendance"
  | "history"
  | "profile"
  | "announcements"
  | "schedule"
  | "lateStudents"
  | "classAttendance";

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};
