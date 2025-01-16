import React, { useState } from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import footer_logo from '../Assets/logo_big.png';
import insta_icon from '../Assets/instagram_icon.png';
import pintester_icon from '../Assets/pintester_icon.png';
import what_icon from '../Assets/whatsapp_icon.png';

const Footer = () => {
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [contactMethod, setContactMethod] = useState(null);

  const handleContactClick = (method) => {
    setContactMethod(method);
    setShowContactPopup(true);
  };

  const closePopup = () => {
    setShowContactPopup(false);
    setContactMethod(null);
  };

  return (
    <div className="footer">
      <div className="footer-logo">
        <img src={footer_logo} alt="Mangu Logo" />
        <p>
          MANGU <br /> ONLINE <br /> MARKET
        </p>
      </div>
      <ul className="footer-links">
        <li>
          <Link to="/AllProducts">AllProducts</Link>
        </li>
        <li>
          <Link to="/client-orders">Company</Link>
        </li>
        <li>
          <Link to="/offices">Offices</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        {/* <li>
          <button onClick={() => handleContactClick('contact')}>Contact</button>
        </li> */}
      </ul>
      <div className="footer-social-icon">
        <button onClick={() => handleContactClick('whatsapp')}>
          <img src={what_icon} alt="WhatsApp" />
        </button>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <img src={insta_icon} alt="Instagram" />
        </a>
        <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer">
          <img src={pintester_icon} alt="Pinterest" />
        </a>
      </div>
      {showContactPopup && (
        <div className="contact-popup">
          <h4>Contact Us</h4>
          {contactMethod === 'contact' && (
            <>
              <textarea rows="4" placeholder="Type your message here"></textarea>
              <button>Send</button>
            </>
          )}
          {contactMethod === 'whatsapp' && (
            <>
              <p>WhatsApp Us: Start typing your message below</p>
              <textarea rows="4" placeholder="Type your message here"></textarea>
              <button>Send</button>
            </>
          )}
          <button onClick={closePopup} className="close-btn">
            Close
          </button>
        </div>
      )}
      <div className="copyright">
        <hr />
        <p>Copyright @ 2024 - All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Footer;