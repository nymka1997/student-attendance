
"use client";

import { Megaphone } from "lucide-react";

export default function HomeDashboard() {
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
    </div>
  );
}
