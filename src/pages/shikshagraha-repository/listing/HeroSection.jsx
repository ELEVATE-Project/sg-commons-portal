import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import RepositorySearch from "../../../components/RepositorySearch/RepositorySearch";
import left1 from "assets/hero-section-image-1.svg";
import left2 from "assets/hero-section-image-2.svg";
import right1 from "assets/hero-section-image-3.svg";
import right2 from "assets/hero-section-image-4.svg";
import scrollDownIcon from 'assets/scroll-down.svg';
import { useNavigate } from "react-router-dom";
import ROUTES from "../../../url";
import Notification from "../../../components/ToastMessage/TotastMessage";

export default function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleSearchFromHero = (searchQuery) => {
    navigate(`${ROUTES.SHIKSHAGRAHA_REPOSITORY_LIST}?searchResourceText=${encodeURIComponent(searchQuery)}`);
  };
  const handleScrollDown = () => {
  if (typeof window === "undefined") return;
  window.scrollBy({ top: 600, left: 0, behavior: "smooth" });
};

useEffect(() => {
  if (typeof document === "undefined") return;

  if (!document.getElementById("scroll-animation")) {
    const style = document.createElement("style");
    style.id = "scroll-animation";
    style.innerHTML = `
      @keyframes scrollDown {
        0% {
          transform: translateY(0);
        }

        50% {
          transform: translateY(10px);
        }

        100% {
          transform: translateY(0);
        }
      }
    `;

    document.head.appendChild(style);
  }
}, []);

  return (
    <div
      className="relative w-full overflow-hidden min-h-[78vh] md:min-h-[80vh] flex flex-col bg-heroGradient"
    >
      <div
        className="absolute inset-0 z-0 pointer-events-none md:hidden"
        style={{
          backgroundImage: `url(${left1}), url(${right1}), url(${left2}), url(${right2})`,
          backgroundPosition:
            "left -0.5rem top 4.375rem, right -0.5rem top 6.875rem, left -0.5rem bottom 5rem, right -0.5rem bottom 3.75rem",
          backgroundRepeat: "no-repeat",
          backgroundSize: "4.5rem, 4.5rem, 6rem, 6rem",
        }}
      />

    <div
      className="absolute inset-0 z-0 pointer-events-none hidden md:block"
      style={{
        backgroundImage: `url(${left1}), url(${right1}), url(${left2}), url(${right2})`,
        backgroundPosition:
          "left 3.125rem top 4rem, right 4.25rem top 12.5rem, left 1.875rem bottom 11.25rem, right 1.875rem bottom 1rem",
        backgroundRepeat: "no-repeat",
        backgroundSize: "7.5rem, 7.5rem, 10rem, 10rem",
      }}
    />

    <div className="absolute top-20 left-20 z-0 w-32 h-32 rounded-full bg-white/10 blur-3xl" />
    <div className="absolute bottom-20 right-20 z-0 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
    <div className="absolute top-40 right-40 z-0 w-24 h-24 rounded-full bg-white/10 blur-2xl" />

    <div className="relative z-10 flex flex-1 flex-col items-center text-center px-4 py-6 sm:px-6">
      <div className="flex flex-1 w-full max-w-7xl flex-col items-center justify-center gap-4 md:gap-5">

        {/* Tags */}
        {/* <div className="flex gap-3 flex-wrap justify-center">
          <span className="px-4 py-1 rounded-full border border-white/30 text-white text-sm font-light bg-gray-700/40">
            {t('repository.hero.tags.openAccess')}
          </span>

          <span className="px-4 py-1 rounded-full border border-white/30 text-white text-sm font-light bg-gray-700/40">
            {t('repository.hero.tags.license')}
          </span>
        </div> */}
        <div className="flex items-center justify-center gap-2 mb-4 pt-5">
  <span className="inline-flex items-center px-[0.625rem] py-[0.25rem] rounded-full border border-white/30 bg-[var(--listing-bg-voilet)] text-white text-xs font-normal">
    {t('repository.hero.tags.openAccess')}
  </span>

  <span className="inline-flex items-center px-[0.625rem] py-[0.25rem] rounded-full border border-white/30 bg-[var(--listing-bg-voilet)] text-white text-xs font-normal">
    {t('repository.hero.tags.license')}
  </span>
</div>

        {/* Title */}
<h1
  className="text-white text-center font-bold text-[2rem] md:text-[3.4rem] leading-none tracking-[-0.1rem] md:whitespace-nowrap"
  style={{ fontFamily: "Comfortaa, sans-serif" }}
>
  {t('repository.hero.title')}
</h1>
        {/* Description */}
<p
  className="max-w-2xl text-center text-white font-medium text-[1rem] md:text-[1.2rem] leading-[1.5]"
  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
>
  {t('repository.hero.description')}
</p>    
<Notification />
        <RepositorySearch  onSearch={handleSearchFromHero}/>
          {/* Scroll */}

        

      </div>

      {/* Scroll */}
      <button
        type="button"
        onClick={handleScrollDown}
        aria-label={t("repository.hero.scrollDown")}
        className="
          relative
          mt-8
          shrink-0
          z-20
          flex
          flex-col
          items-center
          border-0
          bg-transparent
          pb-5
          focus-visible:outline
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-white
        "
      >
  <p className="text-[1rem] font-medium text-[var(--listing-text-light)]">
    {t("repository.hero.scrollDown")}
  </p>

  <img
    src={scrollDownIcon}
    alt="Scroll down"
    className="mt-5 h-5 w-5"
    style={{
      animation: "scrollDown 1.4s steps(1, end) infinite",
    }}
  />
      </button>
    </div>
  </div>
  );
}
