
"use client";

import { useEffect, useState } from "react";
import { ChevronRight, UsersRound } from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type SectionsPageProps = {
  grade: string;
  onSelect: (section: string) => void;
};

export default function SectionsPage({
  grade,
  onSelect,
}: SectionsPageProps) {
  const [sectionLetters, setSectionLetters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const firestore = db;

if (!firestore) {
  setError("Firebase холболт олдсонгүй.");
  setLoading(false);
  return;
}

const firestoreDb: import("firebase/firestore").Firestore = firestore;

    if (!firestore) {
      setError("Firebase холболт олдсонгүй.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadSections() {
      setLoading(true);
      setError("");
      setSectionLetters([]);

      try {
        const gradeNumber = grade.match(/\d+/)?.[0] || "";

        if (!gradeNumber) {
          setError("Ангийн дугаар буруу байна.");
          return;
        }

        const studentsQuery = query(
         collection(firestoreDb, "students"),
          where("grade", "==", gradeNumber)
        );

        const snapshot = await getDocs(studentsQuery);

        if (cancelled) return;

        const uniqueSections = Array.from(
          new Set(
            snapshot.docs
              .map((item) => {
                const value = String(item.data().section || "")
                  .trim()
                  .toLocaleUpperCase("mn-MN");

                return value;
              })
              .filter((value) => /^[А-ЯЁӨҮ]$/.test(value))
          )
        ).sort((a, b) => a.localeCompare(b, "mn"));

        setSectionLetters(uniqueSections);
      } catch (err) {
        console.error("Бүлэг татах алдаа:", err);
        if (!cancelled) {
          setError("Бүлгийн мэдээлэл татахад алдаа гарлаа.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSections();

    return () => {
      cancelled = true;
    };
  }, [grade]);

  const gradeNumber = grade.match(/\d+/)?.[0] || "";

  if (loading) {
    return (
      <div className="empty-state">
        <p>Бүлгүүдийг татаж байна...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <p>{error}</p>
      </div>
    );
  }

  if (sectionLetters.length === 0) {
    return (
      <div className="empty-state">
        <UsersRound size={42} />
        <h3>Бүлэг бүртгэгдээгүй байна</h3>
        <p>{grade} -д сурагч бүртгэгдээгүй эсвэл бүлгийн мэдээлэл байхгүй байна.</p>
      </div>
    );
  }

  return (
    <div className="list-page">
      {sectionLetters.map((letter) => {
        const label = `${gradeNumber}${letter.toLowerCase()}`;

        return (
          <button
            key={letter}
            className="select-card"
            onClick={() => onSelect(label)}
          >
            <span className="round-icon">
              <UsersRound />
            </span>

            <strong>{label}</strong>

            <ChevronRight className="chevron" />
          </button>
        );
      })}
    </div>
  );
}
