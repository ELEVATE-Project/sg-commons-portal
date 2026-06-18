import React from "react";
import dandelion from "assets/dandelion-footer.svg";
import dandelion1 from "assets/dandelion-footer-1.svg";
import dandelion2 from "assets/dandelion-footer-2.svg";
import dandelion3 from "assets/dandelion-footer-3.svg";
import "./Footer.css"

const BASE_URL = "https://shikshagraha.org";
const JOIN_MOVEMENT_FORM_LINK =
  "https://docs.google.com/forms/d/e/1FAIpQLSfSX2bzdJzPBOlstfGg7vWqPFaS5weLnPpwIieR1DBdRgepPg/viewform";

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
