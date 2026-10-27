import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore";
import { useTranslation } from "react-i18next";
import { listThemes } from "../repository-api";

const SKELETON_COUNT = 6;

const getThemeIconSrc = icon => {
  if (!icon) return null;

  const trimmed = icon.trim();

  if (trimmed.startsWith("data:")) return trimmed;
  if (trimmed.startsWith("<svg")) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(trimmed)}`;
  }

  return `data:image/svg+xml;base64,${trimmed}`;
};

function ThemeIcon({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-[4.375rem] h-[4.375rem] object-contain"
      onError={() => setFailed(true)}
    />
  );
}

export default function ExploreByTheme() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const replaceRepositoryQueryState = useRepositoryStore((s) => s.replaceRepositoryQueryState);

  const [themes, setThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await listThemes();
        if (isMounted) setThemes(data?.result ?? []);
      } catch {
        if (isMounted) setThemes([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isLoading && themes.length === 0) return null;

  return (
    <section className="w-full mt-8 md:mt-10 mb-5">
      <div className="px-4 sm:px-6 lg:px-0 lg:w-[92.5%] mx-auto">
      <h2 className="text-[1.25rem] md:text-[1.375rem] font-comfortaa font-semibold tracking-[0.0625rem] text-repository-heading mb-5">
        {t("repository.exploreByTheme")}
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-3 px-2 sm:px-3 lg:px-4">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <div
                key={index}
                className="
                  bg-white
                  border
                  border-repository-border
                  rounded-[1rem]
                  p-4
                  sm:py-4 px-6
                  flex
                  flex-col
                  sm:flex-row
                  items-center
                  gap-3
                  sm:gap-5
                  animate-pulse
                "
              >
                <div className="w-16 h-16 rounded-[0.625rem] bg-repository-iconBg shrink-0" />
                <div className="flex-1 flex flex-col items-center sm:items-start gap-[0.563rem]">
                  <div className="h-4 bg-repository-iconBg rounded w-3/4" />
                  <div className="h-3 bg-repository-iconBg rounded w-1/2" />
                </div>
              </div>
            ))
          : themes.map((theme) => {
              const iconSrc = getThemeIconSrc(theme.icon);

              const openTheme = async () => {
                await replaceRepositoryQueryState(
                  { filters: { themes: [{ value: theme.code, display: theme.name }] } },
                  { skipFetch: true }
                );
                navigate(`/resources?theme=${encodeURIComponent(theme.code)}`);
              };

              return (
                <div
                  key={theme.id ?? theme.code}
                  role="button"
                  tabIndex={0}
                  onClick={openTheme}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openTheme();
                    }
                  }}
                  className="
                    bg-white
                    border
                    border-repository-border
                    rounded-[0.75rem]
                    p-4
                    sm:py-4 px-5
                    flex
                    flex-col
                    sm:flex-row
                    items-center
                    gap-3
                    sm:gap-5
                    text-center
                    sm:text-left
                    cursor-pointer
                    transition-all
                    duration-200
                    shadow-sm
                    hover:shadow-md
                    hover:border-repository-borderHover
                    focus-visible:outline
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-repository-borderHover
                  "
                >
<div
  className="
    w-16
    h-16
    rounded-[0.625rem]
    bg-repository-iconBg
    flex
    items-center
    justify-center
    shrink-0
  "
>
  <ThemeIcon src={iconSrc} alt={theme.name} />
</div>

<div className="flex flex-col items-center sm:items-start gap-[0.563rem]">
  <h3
    className="
      font-sourceSans
      text-[1rem]
      font-bold
      leading-[1.25rem]
      text-repository-title
    "
  >
    {theme.name}
  </h3>
  <p
    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
    className="
      text-[0.875rem]
      font-medium
      leading-[1rem]
      text-repository-subtitle
    "
  >
    {theme.media_count} {t("repository.items")}
  </p>
</div>
            </div>
              );
            })}
      </div>
      </div>
    </section>
  );
}
