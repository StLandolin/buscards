"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type BusStatus = {
  stop: string;
  active: boolean;
};

export default function AdminPage() {
  const [statuses, setStatuses] = useState<BusStatus[]>([]);

  async function loadStatuses() {
    const { data, error } = await supabase
      .from("bus_status")
      .select("stop, active")
      .order("stop", { ascending: true });

    if (error) {
      console.error(error);
      alert("Fehler beim Laden des Status");
      return;
    }

    setStatuses(data || []);
  }

  async function toggleStop(stop: string, active: boolean) {
    const { error } = await supabase
      .from("bus_status")
      .update({ active: !active, updated_at: new Date().toISOString() })
      .eq("stop", stop);

    if (error) {
      console.error(error);
      alert("Fehler beim Ändern des Status");
      return;
    }

    loadStatuses();
  }

  useEffect(() => {
    loadStatuses();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        background: "#f3f6f8",
        color: "#1f2933",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          background: "white",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: "32px", marginTop: 0 }}>
          BusCards Dashboard
        </h1>

        <p style={{ color: "#667085" }}>
          Hier kann die Nummernvergabe pro Haltestelle gestartet oder gestoppt werden.
        </p>

        <div style={{ marginTop: "24px", display: "grid", gap: "12px" }}>
          {statuses.map((item) => (
            <div
              key={item.stop}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "16px",
              }}
            >
              <div>
                <strong>Haltestelle {item.stop}</strong>
                <div style={{ fontSize: "14px", color: "#667085" }}>
                  Status: {item.active ? "aktiv" : "inaktiv"}
                </div>
              </div>

              <button
                onClick={() => toggleStop(item.stop, item.active)}
                style={{
                  fontSize: "16px",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  border: "none",
                  background: item.active ? "#991b1b" : "#166534",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {item.active ? "STOP" : "START"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}