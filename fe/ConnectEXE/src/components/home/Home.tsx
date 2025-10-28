import React, { useEffect, useMemo } from "react";
import Header from "./Header";
import Footer from "./Footer";
import './styles/HomeBanner.scss';
import './styles/Home.scss';

const Home: React.FC = () => {
  // Wix-style project data with real images placeholder
  const DEFAULT_POSTER = useMemo(
    () =>
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'>` +
          `<defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#667eea'/><stop offset='100%' stop-color='#764ba2'/></linearGradient></defs>` +
          `<rect width='400' height='300' fill='url(#bg)'/>` +
          `<rect x='20' y='20' width='360' height='260' rx='12' fill='rgba(0,0,0,0.3)'/>` +
          `<g fill='white' font-family='Inter,Arial' text-anchor='middle'>` +
            `<text x='200' y='160' font-size='18' font-weight='600'>Project Image</text>` +
          `</g>` +
        `</svg>`
      ),
    []
  );

  const featuredProjects = [
    { 
      id: 1, 
      title: "WINDOU", 
      desc: "Windou là ứng dụng thông minh tích hợp trí tuệ nhân tạo trong tính toán và thương mại hóa rác thải tái chế thông qua tín chỉ Carbon.", 
      img: DEFAULT_POSTER,
      number: "1"
    },
    { 
      id: 2, 
      title: "DELIGENT", 
      desc: "Deligent là nền tảng thiết kế áo thun và phụ kiện ứng dụng Trí tuệ nhân tạo tiên phong đi đầu tại Việt Nam.", 
      img: DEFAULT_POSTER,
      number: "2"
    },
    { 
      id: 3, 
      title: "SENONIKA", 
      desc: "SENONIKA là thương hiệu hàng đầu về giày dép ứng dụng công nghệ in 3D tại Việt Nam, nhằm tạo ra sản phẩm thân thiện môi trường, đơn giản hóa chuỗi cung ứng và nâng cao tính bền vững.", 
      img: DEFAULT_POSTER,
      number: "3"
    },
  ];

  const galleryImages = [
    DEFAULT_POSTER, DEFAULT_POSTER, DEFAULT_POSTER, DEFAULT_POSTER, DEFAULT_POSTER, DEFAULT_POSTER
  ];

  const statsData = [
    { number: "105+", label: "Nhà khởi nghiệp trẻ", color: "blue" },
    { number: "15+", label: "Startup gọi vốn thành công", color: "gray" },
    { number: "48+", label: "Dự án công nghệ", color: "green" },
  ];

  const partners = [
    "/// Image", "POLAR", "Eembreeque", "Ocean"
  ];

  const voteTeams = [
    { id: 1, name: "WINDOU", founder: "Nguyễn Đình Phong" },
    { id: 2, name: "DELIGENT", founder: "Võ Quốc Thịnh" },
    { id: 3, name: "SENONIKA", founder: "Nguyễn Minh Tân" },
  ];

  const forumArticles = [
    { 
      id: 1, 
      title: "TOP 5 Dự án khởi nghiệp xuất sắc nhất FPT", 
      source: "AGIAI Science Journal", 
      date: "November 2035"
    },
    { 
      id: 2, 
      title: "Hồi ức Di sản: Khi nghệ thuật bài chòi bước vào thế giới công nghệ trẻ", 
      source: "Biotech Frontier Review", 
      date: "May 2035"
    },
    { 
      id: 3, 
      title: "DIMO: Giải pháp AI Motion Capture \"made in FPTU\"", 
      source: "IBRM Magazine", 
      date: "March 2035"
    },
  ];

  // Scroll-reveal observer for elements with .reveal
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-inview'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
      <div className="wix-homepage">
        <Header breadcrumbs={[]} />

        <main className="wix-main">
          {/* ID DUY NHẤT: Thuộc nhóm "Khám phá dự án" */}
          <section id="kham-pha-du-an-hero" className="wix-hero">
            <div className="wix-hero-content">
              <h1 className="wix-hero-title">Khám phá dự án khởi nghiệp tiêu biểu 2025</h1>
              <button className="wix-cta-button">Khám phá ngay</button>
            </div>
          </section>

          {/* ID DUY NHẤT: Thuộc nhóm "Tin tức" */}
          <section id="tin-tuc-gallery" className="wix-gallery-section">
            <div className="wix-gallery-header">
              <h2 className="wix-section-title">Hơn 50+ nhà khởi nghiệp trẻ</h2>
              <div className="wix-gallery-stats">
                <span>48+ dự án công nghệ</span>
                <span>20+ dự án công nghiệp</span>
                <span>10+ dự án tái tạo môi trường</span>
              </div>
            </div>
            <div className="wix-gallery-grid">
              {galleryImages.map((img, i) => (
                <div key={i} className="wix-gallery-item reveal">
                  <img src={img} alt={`Gallery ${i + 1}`} loading="lazy" decoding="async" />
                </div>
              ))}
            </div>
          </section>

          {/* ID DUY NHẤT: Thuộc nhóm "Khám phá dự án" */}
          <section id="kham-pha-du-an-featured" className="wix-featured-section">
            <h2 className="wix-section-title">Dự án tiêu biểu nhất 2025</h2>
            <p className="wix-featured-subtitle">Trải nghiệm học tập cá nhân hóa do sinh viên Việt phát triển</p>
            <p className="wix-featured-description">
              Xuất phát từ những khó khăn trong việc tìm ra phương pháp học hiệu quả cho em trai mình, 
              Vũ Trung Quân – sinh viên FPTU campus Hà Nội, Founder dự án Aithenos đã cùng các cộng sự 
              là sinh viên đến từ nhiều trường đại học khác chung tay xây dựng Aithenos – một ứng dụng AI 
              giúp cá nhân hóa lộ trình học tập cho học sinh.
            </p>
            <div className="wix-featured-projects">
              {featuredProjects.map((project) => (
                <div key={project.id} className="wix-project-card reveal">
                  <div className="wix-project-overlay">
                    <div className="wix-project-number">{project.number}</div>
                    <div className="wix-project-content">
                      <h3 className="wix-project-title">{project.title}</h3>
                      <p className="wix-project-desc">{project.desc}</p>
                    </div>
                  </div>
                  <div className="wix-project-image">
                    <img src={project.img} alt={project.title} loading="lazy" decoding="async" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ID DUY NHẤT: Thuộc nhóm "Khám phá dự án" */}
          <section id="kham-pha-du-an-products" className="wix-products-section">
            <h2 className="wix-section-title">Sản phẩm dự án tiêu biểu</h2>
            <p className="wix-section-subtitle">Technology, Education, Recycle</p>
            <p className="wix-products-desc">
              Một số sản phẩm và dự án tiêu biểu được đánh giá cao và đạt hiệu quả trong những lần chạy thử nghiệm.
            </p>
            <div className="wix-products-showcase">
              <div className="wix-product-highlight">SmartPure</div>
            </div>
          </section>

          {/* ID DUY NHẤT: Thuộc nhóm "Tin tức" */}
          <section id="tin-tuc-stats" className="wix-stats-section">
            <h2 className="wix-section-title">Những con số ấn tượng</h2>
            <div className="wix-stats-grid">
              {statsData.map((stat, i) => (
                <div key={i} className={`wix-stat-card wix-stat-${stat.color} reveal`}>
                  <div className="wix-stat-number">{stat.number}</div>
                  <div className="wix-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ID DUY NHẤT: Thuộc nhóm "Tin tức" */}
          <section id="tin-tuc-partners" className="wix-partners-section">
            <div className="wix-partners-header">
              <span className="wix-partners-label">Nhà khởi nghiệp</span>
              <h2 className="wix-section-title">STARTUP PARTNER</h2>
            </div>
            <div className="wix-partners-grid">
              {partners.map((partner, i) => (
                <div key={i} className="wix-partner-logo reveal">
                  {partner}
                </div>
              ))}
            </div>
          </section>

          {/* ID DUY NHẤT: Thuộc nhóm "Bình chọn" */}
          <section id="binh-chon" className="wix-vote-section">
            <div className="wix-vote-header">
              <h2 className="wix-section-title">Vote Your Team</h2>
              <p className="wix-vote-subtitle">Bình chọn dự án khởi nghiệp yêu thích của bạn</p>
            </div>
            <div className="wix-vote-list">
              {voteTeams.map((team) => (
                <div key={team.id} className="wix-vote-item reveal">
                  <div className="wix-vote-info">
                    <h3 className="wix-vote-name">{team.name}</h3>
                    <p className="wix-vote-founder">Founder: {team.founder}</p>
                  </div>
                  <button className="wix-vote-button"><span>VOTE</span></button>
                </div>
              ))}
            </div>
          </section>

          {/* ID DUY NHẤT: Thuộc nhóm "Diễn đàn" */}
          <section id="dien-dan" className="wix-forum-section">
            <h2 className="wix-section-title">Diễn đàn thảo luận</h2>
            <div className="wix-forum-grid">
              {forumArticles.map((article) => (
                <div key={article.id} className="wix-forum-card reveal">
                  <h3 className="wix-forum-title">{article.title}</h3>
                  <div className="wix-forum-meta">
                    <span className="wix-forum-source">{article.source}</span>
                    <span className="wix-forum-date">{article.date}</span>
                  </div>
                  <button className="wix-forum-cta">READ ARTICLE</button>
                </div>
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    );
  };

export default Home;