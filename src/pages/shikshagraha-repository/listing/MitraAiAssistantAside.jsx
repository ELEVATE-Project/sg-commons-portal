import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MdMoreVert } from "react-icons/md";
import ROUTES from "../../../url";
import { rootPath } from "utils/constants";
import aiBookIcon from "../../../assets/hugeicons_ai-book.svg";
import { X } from "lucide-react";
import { theme } from "../../../theme";

export default function MitraAiAssistantAside({ defaultBottom = 70 }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [renderCard, setRenderCard] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const buttonBottom = defaultBottom;
  const buttonHeight = isMobile ? 56 : 64;
  const cardGap = 12;
  const cardBottom = buttonBottom + buttonHeight + cardGap;

  const handleClick = () => {
    const fullUrl = `${window.location.origin}${rootPath}${ROUTES.MITRA_CHAT}`;
    window.open(fullUrl, "_blank");
  };

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    };
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  useEffect(() => {
    if (open) {
      setRenderCard(true);
      return;
    }

    const timeout = setTimeout(() => setRenderCard(false), 300);
    return () => clearTimeout(timeout);
  }, [open]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed ${isMobile ? "right-4" : "right-10"} z-[9999] bg-[var(--listing-primary)] text-white border border-white ${isMobile ? "w-14 h-14" : "w-16 h-16"} rounded-full shadow-[0_1.125rem_2.5rem_rgba(0,0,0,0.45)] flex items-center justify-center`}
        style={{
          bottom: `${buttonBottom}px`,
        }}
      >
        {open ? (
          <X className={`${isMobile ? "w-6 h-6" : "w-8 h-8"}`} />
        ) : (
          <img src={aiBookIcon} alt="AI Book" className={`${isMobile ? "w-7 h-7" : "w-8 h-8"}`} />
        )}
      </button>

      {/* Floating Card */}
      {renderCard && (
        <aside
          className={`mitra-floating fixed z-[9999] ${isMobile ? "left-4 right-4 max-w-[calc(100vw-2rem)]" : "right-20 w-72"} bg-white px-3 py-3 md:px-4 md:py-6 rounded-lg shadow-2xl ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}
          style={{
            ...theme.vars,
            bottom: `${cardBottom}px`,
            maxHeight: "calc(100vh - 8.75rem)",
            overflowY: "auto",
            transition: "bottom 220ms ease-out, opacity 220ms ease-out, transform 220ms ease-out",
            willChange: "bottom, transform, opacity",
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-bold leading-[1.75rem]">
              {t("mitraAiAssistant")}
            </h3>
            {/* <MdMoreVert className="w-5 h-5 text-[var(--listing-subdued-text)]" /> */}
          </div>

          <div className="h-[0.0625rem] border-t border-[var(--listing-border)] my-2 md:my-4"></div>

          <div className="rounded-lg p-2 md:p-3 bg-[var(--listing-surface)]">
            <p className="font-normal text-xs leading-[1rem] text-[var(--listing-muted-text)]">
              {t("generateMicroImprovementProjectsDescription")}
            </p>
          </div>

          <button
            onClick={handleClick}
            className="w-full p-2 flex justify-center items-center 
                       rounded-lg bg-[var(--listing-secondary)] text-white mt-3 text-xs"
          >
            <span className="font-medium">
              {t("generateImprovementProjects")}
            </span>
          </button>
        </aside>
      )}

        <style>{`body.filters-open .mitra-floating { z-index: 40 !important; }`}</style>
    </>
  );
}
