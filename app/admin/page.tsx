"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type BusStatus = {
  stop: string;
  active: boolean;
};

const stops: Record<string, string> = {
  "1": "Rist: Wyhl",
  "2": "SWEG: Wallburg – Schmieheim – Kippenheim – Sulz – Lahr",
  "3": "SWEG: Mahlberg – Kippenheimweiler – Langenwinkel",
  "4": "SWEG: Ringsheim – Rust",
  "5":
    "SBG: Ringsheim – Herbolzheim – Kenzingen – Hecklingen – Malterdingen – Heimbach – Köndringen – Teningen / SWEG: Altdorf – Orschweier – Mahlberg – Kippenheim – Mietersheim – Lahr",
  "6":
    "SWEG: Grafenhausen – Kappel / Rist: Broggingen – Bleichheim – Tutschfelden – Wagenstadt – Nordweil – Bombach",
  "7": "Oestreicher: Bleichheim – Kirnhalden – Freiamt",
  "8": "Rist: Niederhausen – Oberhausen – Weisweil",
  "9":
    "SWEG: Altdorf – Orschweier Bahnhof – Grafenhausen / SWEG: Ettenheimweiler – Münchweier – Ettenheimmünster",
};

export default function AdminPage() {
  const [statuses, setStatuses] = useState<BusStatus[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");

  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

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
      .update({
        active: !active,
        updated_at: new Date().toISOString(),
      })
      .eq("stop", stop);

    if (error) {
      console.error(error);
      alert("Fehler beim Ändern des Status");
      return;
    }

    loadStatuses();
  }

  useEffect(() => {
    const savedAuth = localStorage.getItem("buscards-admin-auth");

    if (savedAuth === "true") {
      setAuthorized(true);
      loadStatuses();
    }
  }, []);

  function handleLogin() {
    if (password === adminPassword) {
      localStorage.setItem("buscards-admin-auth", "true");
      setAuthorized(true);
      loadStatuses();
    } else {
      alert("Falsches Passwort");
    }
  }

  if (!authorized) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial, sans-serif",
          background: "#f3f6f8",
          padding: "24px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <h1>BusCards Admin</h1>

          <p style={{ color: "#667085" }}>
            Bitte Passwort eingeben.
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            style={{
              marginTop: "16px",
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #d0d5dd",
              fontSize: "16px",
            }}
          />

          <button
            onClick={handleLogin}
            style={{
              marginTop: "20px",
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: "#1f2933",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Anmelden
          </button>
        </div>
      </main>
    );
  }

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
          Hier kann die Nummernvergabe pro Haltestelle gestartet oder gestoppt
          werden.
        </p>

        <div
          style={{
            marginTop: "24px",
            display: "grid",
            gap: "12px",
          }}
        >
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
                gap: "16px",
              }}
            >
              <div>
                <strong>Haltestelle {item.stop}</strong>

                <div
                  style={{
                    fontSize: "14px",
                    color: "#667085",
                    marginTop: "4px",
                  }}
                >
                  {stops[item.stop]}
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    color: "#667085",
                    marginTop: "8px",
                  }}
                >
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
                  minWidth: "100px",
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