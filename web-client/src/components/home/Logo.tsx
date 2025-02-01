import React from 'react';
import './Logo.css';

const Logo: React.FC = () => {
  return (
    <div className="logo">
      <div className="logo-icon">
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Forme principale - route stylisée */}
          <path d="M10 25C10 15 20 5 25 5C30 5 40 15 40 25C40 35 30 45 25 45C20 45 10 35 10 25Z" 
                fill="#4F46E5" />
          {/* Accent - flèche stylisée */}
          <path d="M25 15L35 25L25 35L15 25L25 15Z" 
                fill="white" />
          {/* Point central */}
          <circle cx="25" cy="25" r="3" 
                  fill="#1F2937" />
        </svg>
      </div>
      <div className="logo-text">
        <span className="company-name">TransSwift</span>
        <span className="tagline">Transport & Logistique</span>
      </div>
    </div>
  );
};

export default Logo;
