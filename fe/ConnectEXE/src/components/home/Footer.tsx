import React from 'react';
import './styles/Footer.scss';
// translations removed; using plain strings
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_ADDRESS } from '../../constants/ContactConst';

const Footer: React.FC = () => {
  // translation mapping removed
  return (
    <footer className="footer-container">
      <div className="top-border"></div>
      <div className="footer-content">
        <div className="footer-columns">
          <div className="footer-col">
            <div className="footer-title">Star Theater</div>
            <div className="footer-info-item"><i className="fas fa-map-marker-alt"></i> {CONTACT_ADDRESS}</div>
            <div className="footer-info-item"><i className="fas fa-envelope"></i> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></div>
            <div className="footer-info-item"><i className="fas fa-phone"></i> <a href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE}</a></div>
          </div>
          <div className="footer-col">
            <div className="footer-title">Terms</div>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">FAQ</a>
            <a href="#">Help</a>
          </div>
          <div className="footer-col">
            <div className="footer-title">Connect</div>
            <div className="footer-social">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
          <div className="footer-col">
            <div className="footer-title">Customer Care</div>
            <div>Hotline: <a href="tel:02773945672">02773945672</a></div>
            <div>Working hours: 8:00 - 22:00</div>
            <div>Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></div>
          </div>
        </div>
        <div className="footer-divider-strong"></div>
        <div className="footer-company-row">
          <div className="footer-company-info">
            <b>STAR THEATER VIETNAM</b> | © 2024<br />
            Address: {CONTACT_ADDRESS} | Phone: {CONTACT_PHONE}
          </div>
        </div>
      </div>
      <div className="bottom-border"></div>
    </footer>
  );
};

export default Footer; 