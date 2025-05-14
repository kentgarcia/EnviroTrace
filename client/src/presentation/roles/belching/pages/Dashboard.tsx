import React from "react";

// Dummy icons and chart placeholders
const Icon = ({ children }: { children: React.ReactNode }) => (
  <span style={{ marginRight: 8 }}>{children}</span>
);
const ChartPlaceholder = ({ height = 120 }: { height?: number }) => (
  <div
    style={{
      background: "#f3f4f6",
      borderRadius: 12,
      height,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#bbb",
    }}
  >
    Chart
  </div>
);

const stats = [
  {
    label: "Active bookings",
    value: "85%",
    sub: "+5%",
    desc: "Compared to 114 last month",
    color: "#22c55e",
  },
  {
    label: "Room occupancy",
    value: "65%",
    sub: "-10%",
    desc: "Compared to 75% last month",
    color: "#ef4444",
  },
  {
    label: "Guest satisfaction",
    value: "4.7/5",
    sub: "+7%",
    desc: "Compared to 4.3/5 last month",
    color: "#22c55e",
  },
];

const bookings = [
  {
    id: 1223,
    name: "Alex Trie",
    email: "Alex08@gmail.com",
    room: "S-01",
    type: "Single",
    in: "Jan 21, 2025",
    out: "Jan 26, 2025",
    status: "New",
  },
  {
    id: 1224,
    name: "Annette Black",
    email: "Ann23@gmail.com",
    room: "S-22",
    type: "Single",
    in: "Jan 8, 2025",
    out: "Jan 12, 2025",
    status: "Checked In",
  },
  {
    id: 1225,
    name: "Jerome Bell",
    email: "JB002@gmail.com",
    room: "D-08",
    type: "Double",
    in: "Jan 13, 2025",
    out: "Jan 21, 2025",
    status: "Confirmed",
  },
  {
    id: 1226,
    name: "Jenny Wilson",
    email: "WilsoN77@gmail.com",
    room: "D-05",
    type: "Double",
    in: "Jan 27, 2025",
    out: "Jan 29, 2025",
    status: "Checked Out",
  },
  {
    id: 1227,
    name: "Kristin Watson",
    email: "Kris09@gmail.com",
    room: "De-02",
    type: "Deluxe",
    in: "Jan 2, 2025",
    out: "Jan 5, 2025",
    status: "Cancelled",
  },
];

const statusColors: Record<string, string> = {
  New: "#a3e635",
  "Checked In": "#38bdf8",
  Confirmed: "#4ade80",
  "Checked Out": "#818cf8",
  Cancelled: "#f87171",
};

export default function Dashboard() {
  return (
    <div style={{ background: "#111827", minHeight: "100vh", padding: 0 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "32px 40px 0 40px",
        }}
      >
        <div>
          <h2 style={{ color: "#fff", fontWeight: 600, fontSize: 28 }}>
            Good morning, Alex!
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#fff", opacity: 0.7 }}>January 9, 2024</span>
          <button
            style={{
              background: "#a78bfa",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            + New reservation
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", gap: 24, padding: 40 }}>
        {/* Left column */}
        <div
          style={{ flex: 3, display: "flex", flexDirection: "column", gap: 24 }}
        >
          {/* Actions and stats */}
          <div style={{ display: "flex", gap: 16 }}>
            <button
              style={{
                flex: 1,
                background: "#22c55e",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "24px 0",
                fontWeight: 600,
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              Check in
            </button>
            <button
              style={{
                flex: 1,
                background: "#18181b",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "24px 0",
                fontWeight: 600,
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              Check out
            </button>
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1.2,
                  background: "#fff",
                  borderRadius: 12,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <span style={{ color: "#64748b", fontSize: 14 }}>
                  {s.label}
                </span>
                <span style={{ fontWeight: 700, fontSize: 28 }}>{s.value}</span>
                <span style={{ color: s.color, fontWeight: 600 }}>{s.sub}</span>
                <span style={{ color: "#a1a1aa", fontSize: 12 }}>{s.desc}</span>
              </div>
            ))}
          </div>

          {/* Booking table */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              marginTop: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#18181b" }}>
                New booking
              </h3>
              <select
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  padding: "4px 12px",
                  fontSize: 14,
                }}
              >
                <option>Today</option>
                <option>This week</option>
                <option>This month</option>
              </select>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "#f3f4f6",
                    color: "#64748b",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  <th style={{ padding: 8, borderRadius: 6 }}>Booking ID</th>
                  <th style={{ padding: 8 }}>Guest name</th>
                  <th style={{ padding: 8 }}>Email</th>
                  <th style={{ padding: 8 }}>Room number</th>
                  <th style={{ padding: 8 }}>Room type</th>
                  <th style={{ padding: 8 }}>Checked In</th>
                  <th style={{ padding: 8 }}>Checked Out</th>
                  <th style={{ padding: 8 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: 8, fontWeight: 600 }}>#{b.id}</td>
                    <td style={{ padding: 8 }}>{b.name}</td>
                    <td style={{ padding: 8 }}>{b.email}</td>
                    <td style={{ padding: 8 }}>{b.room}</td>
                    <td style={{ padding: 8 }}>{b.type}</td>
                    <td style={{ padding: 8 }}>{b.in}</td>
                    <td style={{ padding: 8 }}>{b.out}</td>
                    <td style={{ padding: 8 }}>
                      <span
                        style={{
                          background: statusColors[b.status] || "#e5e7eb",
                          color: "#18181b",
                          borderRadius: 8,
                          padding: "4px 12px",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div
          style={{
            flex: 1.2,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Booking chart */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span style={{ color: "#18181b", fontWeight: 600 }}>Booking</span>
              <select
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontSize: 13,
                }}
              >
                <option>Quantity</option>
                <option>Revenue</option>
              </select>
            </div>
            <ChartPlaceholder height={100} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 12,
                color: "#64748b",
                fontSize: 14,
              }}
            >
              <span>January</span>
              <span>February</span>
              <span>March</span>
            </div>
          </div>
          {/* Top category chart */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span style={{ color: "#18181b", fontWeight: 600 }}>
                Top category
              </span>
              <select
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontSize: 13,
                }}
              >
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <ChartPlaceholder height={140} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 12,
                color: "#64748b",
                fontSize: 14,
              }}
            >
              <span>56% Double room</span>
              <span>30% Single room</span>
              <span>14% Deluxe room</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
