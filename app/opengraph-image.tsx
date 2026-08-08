import { ImageResponse } from "next/og";

export const alt = "Hasan Durusoy psikoloji kliniği";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #1D3557 0%, #13243D 100%)",
        color: "white",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "80px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 950 }}>
        <span
          style={{
            color: "#C9D8EB",
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Bilgi · Güven · Açıklık
        </span>
        <strong style={{ fontSize: 78, lineHeight: 1.05, marginTop: 28 }}>
          Hasan Durusoy
        </strong>
        <span
          style={{
            color: "#E9EEF5",
            fontSize: 34,
            lineHeight: 1.4,
            marginTop: 26,
          }}
        >
          Psikoloji kliniği bilgilendirme ve randevu talep sitesi
        </span>
      </div>
    </div>,
    size,
  );
}
