
"use client";

import { useEffect, useState } from "react";
import { Megaphone, CalendarDays } from "lucide-react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Notice = {
  id: string;
  title: string;
  body: string;
  date: string;
};

export default function HomeDashboard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
useEffect(() => {
  if (!db) {
    setError("Firebase холболт үүсээгүй байна.");
    setLoading(false);
    return;
  }

  const q = query(
    collection(db, "announcements"),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const savedNotices: Notice[] = snapshot.docs.map((item) => {
        const data = item.data();

        return {
          id: item.id,
          title: String(data.title ?? ""),
          body: String(data.body ?? ""),
          date: String(data.date ?? ""),
        };
      });

      setNotices(savedNotices);
      setLoading(false);
      setError("");
    },
    (err) => {
      console.error("Зар унших алдаа:", err);
      setError("Зар, мэдээг уншиж чадсангүй.");
      setLoading(false);
    }
  );

  return () => unsubscribe();
}, []);

  return (
    <div className="list-page" style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: "#e0f7f5",
            color: "#009e91",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Megaphone size={25} />
        </div>

        <div>
          <h3 style={{ margin: 0, color: "#10264b" }}>
            Админы зар
          </h3>
          <p
            style={{
              margin: "5px 0 0",
              color: "#667085",
              fontSize: 13,
            }}
          >
            Сургуулийн зар, мэдэгдэл
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 30, color: "#667085" }}>
          Зар, мэдээ уншиж байна...
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: 25, color: "#dc2626" }}>
          {error}
        </div>
      ) : notices.length === 0 ? (
        <div
          style={{
            border: "1px solid #e5eaf1",
            borderRadius: 14,
            padding: 20,
            background: "#fff",
            textAlign: "center",
          }}
        >
          <Megaphone size={34} color="#98a2b3" />

          <h3 style={{ color: "#344054", fontSize: 16 }}>
            Одоогоор зар алга
          </h3>

          <p style={{ color: "#667085", fontSize: 13 }}>
            Админаас нийтэлсэн зар, мэдэгдэл энд харагдана.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notices.map((notice) => (
            <article
              key={notice.id}
              style={{
                background: "#fff",
                border: "1px solid #e5eaf1",
                borderRadius: 14,
                padding: 16,
                boxShadow: "0 3px 12px rgba(16,38,75,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    background: "#e0f7f5",
                    color: "#009e91",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Megaphone size={19} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#10264b",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {notice.title}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginTop: 5,
                      color: "#98a2b3",
                      fontSize: 12,
                    }}
                  >
                    <CalendarDays size={13} />
                    {notice.date}
                  </div>
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "#475467",
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {notice.body}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
