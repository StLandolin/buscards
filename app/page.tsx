"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

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

function BusTicket() {
  const searchParams = useSearchParams();
  const stop = searchParams.get("stop") || "unbekannt";
  const stopName = stops[stop] || "Unbekannte Haltestelle";

  const [ticketNumber, setTicketNumber] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    const myTicketKey = `buscards-stop-${stop}-date-${today}-my-ticket`;
    const myExpiresKey = `buscards-stop-${stop}-date-${today}-expires-at`;

    const existingTicket = localStorage.getItem(myTicketKey);
    const existingExpiresAt = localStorage.getItem(myExpiresKey);

    if (existingTicket && existingExpiresAt) {
      const expiresDate = new Date(existingExpiresAt);

      if (expiresDate > new Date()) {
        setTicketNumber(Number(existingTicket));
        setExpiresAt(
          expiresDate.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } else {
        localStorage.removeItem(myTicketKey);
        localStorage.removeItem(myExpiresKey);
        setTicketNumber(null);
        setExpiresAt(null);
      }
    }
  }, [stop]);

  useEffect(() => {
    async function fetchBusStatus() {
      const { data, error } = await supabase
        .from("bus_status")
        .select("active")
        .eq("stop", stop)
        .single();

      if (error) {
        console.error("Fehler beim Laden des Busstatus:", error);
        setLoadingStatus(false);
        return;
      }

      setIsActive(data.active);
      setLoadingStatus(false);
    }

    fetchBusStatus();
  }, [stop]);

  async function getTicket() {
    const today = new Date().toISOString().split("T")[0];

    const myTicketKey = `buscards-stop-${stop}-date-${today}-my-ticket`;
    const myExpiresKey = `buscards-stop-${stop}-date-${today}-expires-at`;

    const existingTicket = localStorage.getItem(myTicketKey);
    const existingExpiresAt = localStorage.getItem(myExpiresKey);

    if (existingTicket && existingExpiresAt) {
      const expiresDate = new Date(existingExpiresAt);

      if (expiresDate > new Date()) {
        setTicketNumber(Number(existingTicket));
        setExpiresAt(
          expiresDate.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
        return;
      }

      localStorage.removeItem(myTicketKey);
      localStorage.removeItem(myExpiresKey);
    }

    const { data: lastTicket, error: fetchError } = await supabase
      .from("tickets")
      .select("ticket_number")
      .eq("stop", stop)
      .eq("ticket_date", today)
      .order("ticket_number", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Supabase fetchError:", JSON.stringify(fetchError, null, 2));
      alert(fetchError.message || "Unbekannter Supabase-Fehler");
      return;
    }

    const nextNumber =
      lastTicket && lastTicket.length > 0
        ? lastTicket[0].ticket_number + 1
        : 1;

    const expiresDate = new Date();
    expiresDate.setMinutes(expiresDate.getMinutes() + 20);

    const { error: insertError } = await supabase.from("tickets").insert([
      {
        stop: stop,
        ticket_number: nextNumber,
        ticket_date: today,
        expires_at: expiresDate.toISOString(),
      },
    ]);

    if (insertError) {
      console.error("Supabase insertError:", JSON.stringify(insertError, null, 2));
      alert(insertError.message || "Fehler beim Speichern des Tickets");
      return;
    }

    localStorage.setItem(myTicketKey, String(nextNumber));
    localStorage.setItem(myExpiresKey, expiresDate.toISOString());

    setTicketNumber(nextNumber);
    setExpiresAt(
      expiresDate.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }

  if (loadingStatus) {
    return <div>Lade BusCards...</div>;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        background: "#f3f6f8",
        color: "#1f2933",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "32px",
          maxWidth: "420px",
          width: "100%",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ fontSize: "20px", marginBottom: "8px" }}>
          Haltestelle {stop}
        </p>

        <p style={{ fontSize: "16px", color: "#667085", marginTop: "0" }}>
          {stopName}
        </p>

        {!isActive ? (
          <>
            <h1 style={{ fontSize: "28px" }}>
              Nummernvergabe noch nicht gestartet
            </h1>

            <p style={{ marginTop: "16px" }}>
              Bitte warten Sie auf die Busaufsicht.
            </p>
          </>
        ) : ticketNumber === null ? (
          <>
            <h1 style={{ fontSize: "32px" }}>Buskarte anfordern</h1>

            <button
              onClick={getTicket}
              style={{
                marginTop: "24px",
                fontSize: "22px",
                padding: "16px 28px",
                borderRadius: "16px",
                border: "none",
                background: "#1f2933",
                color: "white",
                cursor: "pointer",
              }}
            >
              Nummer erhalten
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: "18px", marginBottom: "8px" }}>
              Deine Nummer
            </p>

            <h1 style={{ fontSize: "96px", margin: "0" }}>{ticketNumber}</h1>

            {expiresAt && (
              <p style={{ fontSize: "18px", marginTop: "16px" }}>
                gültig bis {expiresAt} Uhr
              </p>
            )}

            <p style={{ fontSize: "14px", color: "#667085", marginTop: "24px" }}>
              Bitte beim Einsteigen vorzeigen.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Lade BusCards...</div>}>
      <BusTicket />
    </Suspense>
  );
}