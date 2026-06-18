import React, { useEffect, useState } from "react"
import HeroSection from "../../pages/shikshagraha-repository/listing/HeroSection"
import { clearMitraSessionStorage } from "utils/helpers"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import ROUTES from "../../url"
import { FiArrowLeft } from "react-icons/fi"
import { HiMenu, HiX } from "react-icons/hi"
import "./Header.css"

const BASE_URL = "https://shikshagraha.org"

export default function Header({ isHeroSection = true, isBackButton = false, onSidebarToggle, isSidebarOpen = false }) {
  const { t } = useTranslation("ai_creation_translation")
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Dropdown open state
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <>
      <header className={`flex flex-col !p-3 md:!p-[1.5625rem] md:pb-8 w-full bg-white rounded-[1rem] ${!isMobile ? "shadow-[0rem_0rem_0.25rem_rgba(0,0,0,0.2)]" : ""} ${isMobile && isBackButton ? "items-start" : "items-end"}`}>
        {(isHeroSection || !isMobile) && <div className="w-full">
          <>
            <div data-animation="default" data-collapse="all" data-duration={400} data-easing="ease" data-easing2="ease" data-doc-height={1} role="banner" className="navbar-2 w-nav" style={{ zIndex: 40 }}>
              <div className="header-container !py-0">
                <a href="https://shikshagraha.org/" className="brand w-nav-brand">
                  <img src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Group-22x.png" loading="lazy" alt="" className="image-12" />
                </a>

                {<div className="w-nav-button" onClick={() => setMenuOpen(prev => !prev)}>
                  <div style={menuOpen ? { backgroundColor: "#C8C8C8", color: "white" } : {}} className="w-icon-nav-menu flex items-center justify-center w-12 h-12" />
                </div>}
              </div>
            </div>
            <div className="section_full bhj break-words mb-0 mt-3 md:mt-4">
              <div className="frame hb">
                <div className="div-block-16 hidden md:block" />
                <p className="paragraph asd break-words w-full">A people’s movement towards education equity</p>
              </div>
            </div>
          </>
        </div>}
        {isBackButton && (
          <div className={`flex justify-between w-full ${isMobile && onSidebarToggle ? "gap-2" : ""}`}>
            <button
              className="bg-transparent w-fit p-0 border-0 cursor-pointer inline-flex items-center justify-center"
              onClick={() => {
                const currentRoute = window.location.pathname
                if (!currentRoute.includes(ROUTES.MITRA_CHAT)) {
                  clearMitraSessionStorage()
                  navigate(ROUTES.MITRA_CHAT)
                } else {
                  navigate(`/`)
                }
              }}
            >
              <FiArrowLeft className="w-8 h-8 text-repository-backIcon" />
            </button>
            {isMobile && onSidebarToggle && (
              <button onClick={onSidebarToggle} className="bg-transparent w-fit px-1" aria-label="Toggle sidebar">
                {isSidebarOpen ? <HiX className="w-6 h-6 text-repository-sidebarIcon" /> : <HiMenu className="w-6 h-6 text-repository-sidebarIcon" />}
              </button>
            )}
          </div>
        )}
        {/* {isHeroSection && (
          <div className="mt-[-1rem] flex justify-start w-full">
            <HeroSection />
          </div>
        )}{" "} */}
      </header>
      {isHeroSection && (
        <div className="mt-4 md:mt-6 relative left-1/2 -translate-x-1/2 w-[100vw] max-w-[100vw] overflow-hidden">
          <HeroSection />
        </div>
      )}{" "}
      {menuOpen && (
        <div className="w-screen h-[100dvh]  absolute z-[999] top-0" onClick={() => setMenuOpen(false)}>
          <div className="w-nav-overlay active w-full h-[calc(100vh-9rem)] top-[9rem]" data-wf-ignore="" id="w-nav-overlay-0" style={menuOpen ? { display: "block" } : { height: "0rem", display: "none" }}>
            <nav role="navigation" className={" " + (menuOpen ? "nav-menu w-nav-menu" : "nav-menu w-nav-menu")} onClick={e => e.stopPropagation()}>
              <div className="grid">
                <a href="https://shikshagraha.org/" className="nav-link w-nav-link">
                  Home
                </a>
                <a href={`${BASE_URL}/about-us`} className="nav-link w-nav-link">
                  About Us
                </a>
                <div
                  data-hover="false"
                  data-delay={0}
                  className="dropdown-2 w-dropdown"
                  onClick={e => {
                    e.stopPropagation()
                    setDropdownOpen(!dropdownOpen)
                  }}
                >
                  <div className="dropdown-toggle-2 w-dropdown-toggle">
                    <div className="icon-2 w-icon-dropdown-toggle" />
                    <div className="nav-link dcd asafa w-nav-link">Initiatives</div>
                  </div>
                  {dropdownOpen && (
                    <nav className="dropdown-list-2 grid" onClick={e => e.stopPropagation()}>
                      <a href={`${BASE_URL}/systemic-leadership-collective`} className="nav-link sms w-nav-link">
                        Systemic Leadership Collective
                      </a>
                      <a href={`${BASE_URL}/youth-leadership/`} className="nav-link sms w-nav-link">
                        Youth Leadership Collective
                      </a>
                      <a href={`${BASE_URL}/women`} className="nav-link sms w-nav-link">
                        Women Leadership Collective
                      </a>
                    </nav>
                  )}
                </div>
                <a href={`${BASE_URL}/awards`} className="nav-link w-nav-link">
                  Shikshagraha Awards
                </a>
                <a href={`${BASE_URL}/knowledge-hub`} className="nav-link w-nav-link">
                  Knowledge Hub
                </a>
                <a href={`${BASE_URL}/story-archive`} className="nav-link w-nav-link">
                  Stories of Impact
                </a>
                <a rel="noopener noreferrer" href="https://docs.google.com/forms/d/e/1FAIpQLSfSX2bzdJzPBOlstfGg7vWqPFaS5weLnPpwIieR1DBdRgepPg/viewform" target="_blank" className="nav-link w-nav-link">
                  Join the Movement
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
