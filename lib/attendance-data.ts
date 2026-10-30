import type { Status } from "./attendance-types";

export const grades = Array.from({ length: 12 }, (_, i) => `${i + 1}-р анги`);
export const sections = ["а", "б", "в", "г", "д", "е", "ё"].map((x) => `6${x}`);
export const initialNames = [
  "Бат-Эрдэнэ", "Болор", "Ганзориг", "Мөнхжин", "Саруул",
  "Тэмүүлэн", "Уянга", "Энхжин", "Анужин", "Дөлгөөн",
];
export const statuses: Status[] = ["Ирсэн", "Өвчтэй", "Чөлөөтэй", "Тасалсан"];
export const statusClass: Record<Status, string> = {
  Ирсэн: "present",
  Өвчтэй: "sick",
  Чөлөөтэй: "excused",
  Тасалсан: "absent",
};
