import React from "react";
import dandelion from "../../assets/dandelion-footer.svg";
import dandelion1 from "../../assets/dandelion-footer-1.svg";
import dandelion2 from "../../assets/dandelion-footer-2.svg";
import dandelion3 from "../../assets/dandelion-footer-3.svg";

import env from "../../utils/env"
import "./Footer.css"

const BASE_URL = "https://shikshagraha.org";
const JOIN_MOVEMENT_FORM_LINK =
  "https://docs.google.com/forms/d/e/1FAIpQLSfSX2bzdJzPBOlstfGg7vWqPFaS5weLnPpwIieR1DBdRgepPg/viewform";

// const footerStyles = `
//   .sg-footer {
//     position: relative;
//     overflow: hidden;
//     background: #562f91;
//     color: white;
//     font-family: Montserrat, sans-serif;
//     padding-bottom: 260px;
//   }

//   .sg-footer__bg1 {
//     position: absolute;
//     bottom: 0;
//     left: 0;
//     width: 100%;
//   }

//   .sg-footer__bg2 {
//     position: absolute;
//     top: 140px;
//     right: 42%;
//     width: 50px;
//   }

//   .sg-footer__bg3 {
//     position: absolute;
//     top: 260px;
//     right: 6%;
//     width: 60px;
//   }

//   .sg-footer__bg4 {
//     position: absolute;
//     top: 260px;
//     right: 65%;
//     width: 38px;
//   }

//   .sg-footer__main {
//     display: flex;
//     flex-wrap: wrap;
//     align-items: flex-start;
//     justify-content: space-between;
//     width: min(1200px, calc(100% - 4rem));
//     margin: 0 auto;
//     padding: 80px 0 40px;
//     gap: 56px;
//   }

//   .sg-footer__logo-col {
//     flex: 1 1 360px;
//     max-width: 420px;
//   }

//   .sg-footer__right {
//     display: flex;
//     flex: 1 1 520px;
//     justify-content: flex-start;
//     align-items: flex-start;
//     flex-wrap: wrap;
//     gap: 80px;
//     margin-left: 80px;
//   }

//   .sg-footer__right > div {
//     flex: 1 1 220px;
//     max-width: 240px;
//   }

//   .sg-footer__logo-row {
//     display: flex;
//     align-items: center;
//     gap: 10px;
//     margin-bottom: 12px;
//   }

//   .sg-footer__logo-icon {
//     width: 280px;
//   }

//   .sg-footer__tagline {
//     margin: 0;
//     font-size: 16px;
//     line-height: 1.7;
//     font-weight: 500;
//     max-width: 430px;
//   }

//   .sg-footer__socials {
//     display: flex;
//     gap: 12px;
//     margin-top: 40px;
//   }

//   .sg-footer__social-link {
//     width: 36px;
//     height: 36px;
//     border-radius: 50%;
//     border: 1px solid rgba(255, 255, 255, 0.4);
//     display: flex;
//     align-items: center;
//     justify-content: center;
//   }

//   .sg-footer__nav-heading {
//     font-size: 16px;
//     letter-spacing: 2px;
//     margin-bottom: 18px;
//     font-weight: 700;
//   }

//   .sg-footer__nav-list {
//     list-style: none;
//     padding: 0;
//     margin: 0;
//   }

//   .sg-footer__nav-link {
//     display: inline-flex;
//     align-items: center;
//     font-size: 16px;
//     color: #fff;
//     text-decoration: none;
//     margin-bottom: 20px;
//     font-weight: 400;
//   }

//   .sg-footer__nav-link::before {
//     content: "-";
//     color: #ff8a3d;
//     margin-right: 0;
//     opacity: 0;
//     transform: translateX(-6px);
//     transition: 0.25s;
//   }

//   .sg-footer__nav-link:hover::before {
//     opacity: 1;
//     transform: translateX(0);
//     margin-right: 6px;
//   }

//   .sg-footer__nav-link:hover {
//     color: white;
//   }

//   .sg-footer__join-btn {
//     display: inline-block;
//     margin-top: 20px;
//     padding: 12px 20px;
//     background: #7f3289;
//     border-radius: 25px;
//     text-decoration: none;
//     color: white;
//     width: fit-content;
//     font-weight: 400;
//     font-size: 20px;
//   }

//   .sg-footer__join-btn:hover {
//     background: #fff;
//     color: #7f3289;
//     transform: translateY(-2px);
//   }

//   .sg-footer__bottom {
//     border-top: 1px solid rgba(255, 255, 255, 0.2);
//     display: flex;
//     align-items: flex-start;
//     justify-content: space-between;
//     gap: 24px;
//     font-size: 14px;
//     font-weight: 400;
//     width: min(1200px, calc(100% - 4rem));
//     margin: 0 auto;
//     padding: 30px 0 0;
//   }

//   .sg-footer__bottom p {
//     margin: 0;
//   }

//   @media (max-width: 1024px) {
//     .sg-footer__logo-col {
//       max-width: none;
//     }

//     .sg-footer__right {
//       gap: 40px;
//       margin-left: 0px;
//     }

//     .sg-footer__tagline {
//       max-width: 520px;
//     }

//     .sg-footer {
//       padding-bottom: 110px;
//     }
//   }

//   @media (max-width: 600px) {
//     .sg-footer__right {
//       flex-direction: column;
//       gap: 40px;
//       margin-left: 0px;
//     }

//     .sg-footer__bottom {
//       flex-direction: column;
//       gap: 12px;
//       font-size: 14px;
//       width: calc(100% - 2rem);
//     }

//     .sg-footer__tagline {
//       max-width: none;
//     }

//     .sg-footer__main {
//       gap: 50px;
//       width: calc(100% - 2rem);
//       padding: 40px 0 28px;
//     }

//     .sg-footer__bg2, .sg-footer__bg4 {
//       display: none;
//     }

//     .sg-footer__bg3 {
//       position: absolute;
//         top: 31px;
//         right: 10%;
//         width: 38px;
//     }

//     .sg-footer {
//       padding-bottom: 100px;
//     }
//   }
// `;

const movementLinks = [
  { label: "Home", href: BASE_URL },
  { label: "About Us", href: `${BASE_URL}/about-us` },
  { label: "Impact", href: `https://dashboard.shikshagraha.org/` },
  { label: "Samvaad", href: `${BASE_URL}/media-update/shiksha-samvaad-ignites-national-momentum-for-improving-indias-public-education-system` },
  { label: "Awards", href: `${BASE_URL}/awards` },
  { label: "Commons", href: `https://commons.shikshagraha.org/` },
  { label: "Media" , href: `${BASE_URL}/story-archive`},
];

const connectLinks = [
  { label: "Our Partners", href: `${BASE_URL}/#partners` },
  { label: "FAQs" },
  { label: "hello@shikshagraha.org", href: "mailto:hello@shikshagraha.org" },
];

const socialLinks = [
  {
    href: "https://www.instagram.com/shikshagraha/",
    img: "https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Group-16.svg",
  },
  {
    href: "https://www.linkedin.com/company/shikshagraha/",
    img: "https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Group-12.svg",
  },
  {
    href: "https://www.facebook.com/shikshagraha",
    img: "https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Group-14.svg",
  },
  {
    href: "https://x.com/Shikshagraha",
    img: "https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Image-39.png",
  },
  {
    href: "https://www.youtube.com/@shikshagraha",
    img: "https://shikshagraha.org/wp-content/uploads/2024/09/youtube-2.png",
  },
];

export default function Footer() {
  return (
    <>
   
      <footer className="sg-footer">
        <img src={dandelion} className="sg-footer__bg1" alt="" />
        <img src={dandelion1} className="sg-footer__bg2" alt="" />
        <img src={dandelion2} className="sg-footer__bg3" alt="" />
        <img src={dandelion3} className="sg-footer__bg4" alt="" />


        <div className="sg-footer__main">

          {/* LEFT */}
          <div className="sg-footer__logo-col">
            <div className="sg-footer__logo-row">
              <img
                src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Group-232-1.svg"
                className="sg-footer__logo-icon"
              />
            </div>

            <p className="sg-footer__tagline">
              Every step towards education. A people's movement to strengthen India's 1 million public schools so every child can learn well and be ready for the future.
            </p>

            <div className="sg-footer__socials">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sg-footer__social-link"
                  aria-label={`Visit ${s.href}`}
                >
                  <img
                    src={s.img}
                    alt="social icon"
                    className="sg-footer__social-icon"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="sg-footer__right">

            {/* MOVEMENT */}
            <div>
              <p className="sg-footer__nav-heading">MOVEMENT</p>
              <ul className="sg-footer__nav-list">
                {movementLinks.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="sg-footer__nav-link">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* CONNECT */}
            <div>
              <p className="sg-footer__nav-heading">CONNECT</p>
              <ul className="sg-footer__nav-list">
                {connectLinks.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="sg-footer__nav-link">
                      {l.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={JOIN_MOVEMENT_FORM_LINK} target="_blank" className="sg-footer__join-btn">
                    Join the Movement
                  </a>
                </li>
              </ul>
            </div>

          </div>

        </div>

        <div className="sg-footer__bottom">
          <p>© 2026 Shikshagraha. All rights reserved.</p>
          <p>4th Floor, Sumo Sapphire, Outer Ring Road, KR Layout, J.P. Nagar, Bengaluru - 560 078.</p>
        </div>
      </footer>
    </>
  );
}
