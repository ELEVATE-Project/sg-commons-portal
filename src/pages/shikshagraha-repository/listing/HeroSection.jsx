import React from "react";
import { useTranslation } from "react-i18next";
import RepositorySearch from "../../../components/RepositorySearch/RepositorySearch";
import left1 from "assets/hero-section-image-1.svg";
import left2 from "assets/hero-section-image-2.svg";
import right1 from "assets/hero-section-image-3.svg";
import right2 from "assets/hero-section-image-4.svg";

export default function HeroSection() {
  const { t } = useTranslation();
  return (
    <div
      className="relative w-full overflow-hidden min-h-[78vh] md:min-h-[70vh] flex items-center justify-center"
      style={{
        background:
          "linear-gradient(180deg, #5B2D90 0%, #8665B5 55%, #D9D0E8 100%)",
      }}
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
          "left 3.125rem top 6.875rem, right 1.25rem top 12.5rem, left 1.875rem bottom 11.25rem, right 1.875rem bottom 5rem",
        backgroundRepeat: "no-repeat",
        backgroundSize: "7.5rem, 7.5rem, 10rem, 10rem",
      }}
    />

    <div className="absolute top-20 left-20 z-0 w-32 h-32 rounded-full bg-white/10 blur-3xl" />
    <div className="absolute bottom-20 right-20 z-0 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
    <div className="absolute top-40 right-40 z-0 w-24 h-24 rounded-full bg-white/10 blur-2xl" />

    <div className="absolute inset-0 z-10 flex items-center justify-center text-center p-4 sm:px-6">
      <div className="flex w-full max-w-7xl flex-col items-center gap-4 md:gap-5 -mt-10">

        {/* Tags */}
        <div className="flex gap-3 flex-wrap justify-center">
          <span className="px-4 py-1 rounded-full border border-white/30 text-white text-sm font-light bg-gray-700/40">
            {t('repository.hero.tags.openAccess')}
          </span>

          <span className="px-4 py-1 rounded-full border border-white/30 text-white text-sm font-light bg-gray-700/40">
            {t('repository.hero.tags.license')}
          </span>
        </div>

        {/* Title */}
        <h1
          className="
            text-[42px]
            sm:text-[52px]
            md:text-[64px]
            lg:text-[72px]
            font-extralight
            leading-[1.08]
            tracking-[-0.03em]
            text-white
            md:whitespace-nowrap
          "
        >
          {t('repository.hero.title')}
        </h1>

        {/* Description */}
        <p
          className="
            max-w-4xl
            text-white/90
            text-[16px]
            md:text-[18px]
            leading-relaxed
            font-normal
          "
        >
          {t('repository.hero.description')}
        </p>

        <RepositorySearch />

        {/* Scroll */}
        <div className="mt-8 text-white/80">
          <p>{t('repository.hero.scrollDown')}</p>
          <div className="animate-bounce text-2xl">⌄</div>
        </div>

      </div>
    </div>
  </div>
  );
}
