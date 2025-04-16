import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "remixicon/fonts/remixicon.css";
import "./header.css"; 

export default function Header() {
  return (
    <div className="navigation">
      <nav className="navbar navbar-expand-sm navbar-dark" style={{ backgroundColor: "#0b0b0b" }}>
        <div className="container-fluid">
          <a className="nav-bar letter-logo"><i className="ri-terminal-box-fill"></i></a>
          <form className="d-flex ms-3" role="search">
            <div className="input-group">
              <input className="form-control" type="search" placeholder="Tìm kiếm..." aria-label="Search" />
              <button className="btn btn-outline-danger" type="submit">Tìm</button>
            </div>
          </form>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><a className="nav-link active" href="/html/lol-homepage.html">Lộ Trình</a></li>
            <li className="nav-item"><a className="nav-link active" href="/html/valorant-homepage.html">Lộ Trình Của Tôi</a></li>
            <li className="nav-item"><a className="nav-link active" href="/html/tft-homepage.html">Về Chúng Tôi</a></li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item d-flex align-items-center">
              <a className="nav-link p-0" href="#">
                <img src="https://flagsapi.com/VN/flat/64.png" alt="Vietnamese" width="30" height="30" />
              </a>
              <span className="border-start mx-2" style={{ height: "24px", display: "inline-block" }}></span>
              <a className="nav-link p-0" href="#">
                <img src="https://flagsapi.com/GB/flat/64.png" alt="English" width="30" height="30" />
              </a>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-outline-danger"
                id="signin-btn"
                onClick={() => window.location.href = 'http://localhost:3000/login'}
              >
                Đăng nhập
              </button>
            </li>
          </ul>
        </div>

        {/* Mobile nav toggle */}
        <label htmlFor="nav-mobile-input" className="nav-home">
          <i className="ri-menu-fill"></i>
        </label>
        <input type="checkbox" className="nav-input-mobile" id="nav-mobile-input" />
        <label htmlFor="nav-mobile-input" className="nav-overlay"></label>

        <nav className="nav-mobile">
          <label htmlFor="nav-mobile-input" className="nav-mobile-close">
            <i className="ri-close-large-line"></i>
          </label>
          <ul className="mobile-list">
            <li className="nav-mobile-item">
              <a className="nav-link active" href="lol-homepage.html">Lộ Trình</a>
            </li>
            <li className="nav-mobile-item">
              <a className="nav-link active" href="valorant-homepage.html">Lộ Trình Của Tôi</a>
            </li>
            <li className="nav-mobile-item">
              <a className="nav-link active" href="tft-homepage.html">Về Chúng Tôi</a>
            </li>
            <li className="nav-item d-flex align-items-center">
              <a className="nav-link p-0" href="#">
                <img src="https://flagsapi.com/VN/flat/64.png" alt="Vietnamese" width="30" height="30" />
              </a>
              <span className="border-start mx-2" style={{ height: "24px", display: "inline-block" }}></span>
              <a className="nav-link p-0" href="#">
                <img src="https://flagsapi.com/GB/flat/64.png" alt="English" width="30" height="30" />
              </a>
            </li>
            <li className="nav-mobile-item">
              <button className="btn btn-outline-danger" id="signin-btn" onClick={() => window.location.href = 'login.html'}>
                Đăng nhập
              </button>
            </li>
          </ul>
        </nav>
      </nav>
    </div>
  );
}
