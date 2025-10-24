import React, { useEffect, useState } from "react"
import { useOAuthRedirect } from "../../hooks/useOAuthRedirect"
import Header from "./Header"
import Footer from "./Footer"
import { Carousel } from "antd"
import axios from "axios"
import "./styles/MovieBanner.scss"

const Home: React.FC = () => {
  // Handle OAuth redirect query params (store user info in localStorage)
  useOAuthRedirect()

  const [topMovies, setTopMovies] = useState<any[]>([])

  useEffect(() => {
    // fetch top banners (fall back to placeholders)
    axios
      .get("/api/admin/movie/top-booked")
      .then((res) => {
        const moviesWithFullPoster = (res.data || []).map((m: any) => ({
          ...m,
          posterUrl:
            m?.posterUrl && String(m.posterUrl).startsWith("http")
              ? m.posterUrl
              : m?.posterUrl
              ? `http://localhost:8080${m.posterUrl}`
              : "/default-poster.png",
        }))
        setTopMovies(moviesWithFullPoster)
      })
      .catch(() => {
        // ignore errors; UI will render placeholders
      })
  }, [])

  const slides = (() => {
    const s = topMovies.slice(0, 5)
    while (s.length < 5) {
      s.push({ posterUrl: "/default-poster.png", title: "" })
    }
    return s
  })()

  const breadcrumbs = [
    {
      text: "Home",
      step: "home" as const,
      onClick: () => {},
    },
  ]

  return (
    <>
      <Header breadcrumbs={breadcrumbs} />

      <main style={{ padding: "24px 16px" }}>
        <section style={{ display: "flex", justifyContent: "center", margin: "32px 0" }}>
          <div style={{ width: "100%", maxWidth: 1100, borderRadius: 20, overflow: "hidden" }}>
            <Carousel autoplay dots arrows>
              {slides.map((movie, idx) => (
                <div key={idx} style={{ width: "100%" }}>
                  <img
                    src={movie.posterUrl}
                    alt={movie.title || `slide-${idx}`}
                    style={{ width: "100%", height: 520, objectFit: "cover", display: "block" }}
                    onError={(e) => (e.currentTarget.src = "/default-poster.png")}
                  />
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        <section style={{ maxWidth: 1100, margin: "24px auto", display: "flex", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div style={{ flex: "0 0 220px", color: "#fff" }}>
                <h1 style={{ fontSize: 56, margin: 0 }}>50+</h1>
                <p style={{ marginTop: 8 }}>Hợp tác với các nhà khởi nghiệp trẻ</p>
              </div>

              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,0.04)", padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>102</div>
                  <div style={{ fontSize: 12 }}>Dự án công nghệ</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>20+</div>
                  <div style={{ fontSize: 12 }}>Dự án thành công trên thị trường</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>10+</div>
                  <div style={{ fontSize: 12 }}>Dự án được vinh danh</div>
                </div>
              </div>
            </div>
          </div>

          <aside style={{ width: 360, background: "linear-gradient(135deg,#5b17ff,#ff5ec7)", padding: 20, borderRadius: 16, color: "#fff" }}>
            <h3 style={{ marginTop: 0 }}>Khám Phá Thêm Các Dự Án Khởi Nghiệp Tiêu Biểu</h3>
            <p style={{ fontSize: 14 }}>Khám phá các nhà khởi nghiệp tiêu biểu qua các dự án công nghệ.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "none", background: "rgba(255,255,255,0.12)", color: "#fff" }}>
                Khám Phá
              </button>
              <button style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "none", background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                Learn More
              </button>
            </div>
          </aside>
        </section>

        {/* Additional content preview (optional) */}
        <section style={{ maxWidth: 1100, margin: "32px auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
            <div style={{ height: 220, borderRadius: 12, background: "linear-gradient(135deg,#0b1224,#20153a)", color: "#fff", padding: 20 }}>
              <h4>Transform Ideas into Reality</h4>
              <p>Power of AI at Your Fingertips · AI Partner for Smarter</p>
            </div>
            <div style={{ height: 220, borderRadius: 12, background: "linear-gradient(135deg,#1b2a52,#40186b)", color: "#fff", padding: 20 }}>
              <h4>Dự án khởi nghiệp</h4>
              <p>Những dự án tiêu biểu đang được phát triển.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default Home
