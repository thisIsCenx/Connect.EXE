import React from 'react';
import './styles/Footer.scss';
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_ADDRESS } from '../../constants/ContactConst';

const Footer: React.FC = () => {
  return (
    <footer className="ex-footer">
      <div className="ex-footer__inner">
        <div className="ex-footer__columns">
          <div className="ex-footer__col">
            <div className="ex-footer__brand">
              <span className="ex-logo">EX</span>
              <span className="ex-wordmark">Connect.<b>exe</b></span>
            </div>
            <div className="ex-footer__office">
              <div className="ex-footer__title">Office</div>
              <div className="ex-footer__item">{CONTACT_ADDRESS}</div>
              <div className="ex-footer__item"><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></div>
              <div className="ex-footer__item"><a href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE}</a></div>
            </div>
          </div>

          <div className="ex-footer__col">
            <div className="ex-footer__title">Explore</div>
            <a href="#">Technology</a>
            <a href="#">Education</a>
            <a href="#">Greentech</a>
          </div>

          <div className="ex-footer__col">
            <div className="ex-footer__title">Menu</div>
            <a href="#">Trang chủ</a>
            <a href="#">Tin tức</a>
            <a href="#">Khám phá dự án</a>
            <a href="#">Về chúng tôi</a>
          </div>

          <div className="ex-footer__col">
            <div className="ex-footer__title">Follow</div>
            <div className="ex-footer__socials">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Instagram">ig</a>
              <a href="#" aria-label="YouTube">yt</a>
            </div>
          </div>
        </div>

        <div className="ex-footer__bottom">
          <div className="ex-footer__legal">
            <a href="#">Terms</a>
            <span>•</span>
            <a href="#">Privacy</a>
            <span>•</span>
            <a href="#">Cookies</a>
          </div>
          <div className="ex-footer__copy">© {new Date().getFullYear()} EX Connect.exe</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 