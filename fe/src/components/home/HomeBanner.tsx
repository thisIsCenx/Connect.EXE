import type React from "react"
// Import hình ảnh từ assets
import moviePosterImage from "../../assets/img/bannerhomemovie1.webp"
import moviePosterImage2 from "../../assets/img/bannerhomemovie2.png"

interface HomeBannerProps {
  type?: "cinemamax" | "moviehub"
}

const HomeBanner: React.FC<HomeBannerProps> = ({ type = "cinemamax" }) => {
  if (type === "moviehub") {
    return (
      <div className="movie-banner moviehub-banner">
        {/* Decorative film strips */}
        <div className="film-strip top">
          <div className="film-holes">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="film-hole"></div>
            ))}
          </div>
        </div>

        <div className="film-strip bottom">
          <div className="film-holes">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="film-hole"></div>
            ))}
          </div>
        </div>

        {/* Main content - Image */}
        <div className="banner-image-container">
          <img
            src={moviePosterImage || "/placeholder.svg"}
            alt="Movie Poster"
            className="banner-image"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=460&width=260"
            }}
          />

          {/* Overlay content */}
          <div className="banner-overlay">
            <div className="overlay-content">
              <h3 className="overlay-title moviehub">Star cinema</h3>
              <p className="overlay-subtitle">Khuyến mãi siêu hot!</p>             
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="movie-banner cinemamax-banner">
      {/* Decorative film strips */}
      <div className="film-strip top">
        <div className="film-holes">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="film-hole"></div>
          ))}
        </div>
      </div>

      <div className="film-strip bottom">
        <div className="film-holes">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="film-hole"></div>
          ))}
        </div>
      </div>

      {/* Main content - Image */}
      <div className="banner-image-container">
        <img
          src={moviePosterImage2 || "/placeholder.svg"}
          alt="Movie Poster"
          className="banner-image"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=460&width=260"
          }}
        />

        {/* Overlay content */}
        <div className="banner-overlay">
          <div className="overlay-content">
            <h3 className="overlay-title cinemamax">Star cinema</h3>
            <p className="overlay-subtitle">Đặt vé siêu ưu đãi!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeBanner
