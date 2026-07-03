import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSiteDataLocalStore } from "store";
import { useChatStorage } from "hooks/useStorage";
import { useRepositoryStore } from "../../pages/shikshagraha-repository/repository-hooks/useRepositoryStore";
import { showNotification } from "../ToastMessage/TotastMessage";
import { handleS3Upload } from "../../services/storage_service";
import { ai4BharatASRApi } from "api/endpoints/ai";
import { isSilentAudio } from "../../utils/helpers";
import { bot_routes } from "configure";
import SearchIcon from "assets/icons/search.svg";
import MicIcon from "assets/icons/mic.svg";
import SendIcon from "assets/icons/send.svg";
import ClearIcon from "assets/icons/clear.svg";
import { useSearchParams } from "react-router-dom";

const scrollToBrowseResources = () => {
  const browseSection = document.querySelector("[data-browse-resources]");
  if (browseSection) {
    browseSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export default function RepositorySearch({ variant = "hero", className = "",onSearch = null  }) {
  const { t } = useTranslation();
  const search = useRepositoryStore((state) => state.searchInput);
  const setGlobalSearch = useRepositoryStore((state) => state.setSearch);
  const setSearchInput = useRepositoryStore((state) => state.setSearchInput);
  const loadingList = useRepositoryStore((state) => state.loadingList);
  const [searchParams, setSearchParams] = useSearchParams();

  const languageToUse = useSiteDataLocalStore((state) => state.chatLanguage);
  const sessionId = useChatStorage()((state) => state.sessionId);

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const [isConvertingVoiceToText, setIsConvertingVoiceToText] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalIdRef = useRef(null);

  const isHeader = variant === "header";
  const disableSendButton =
    search.trim().length === 0 ||
    hasStartedRecording ||
    loadingList ||
    isConvertingVoiceToText;
  const hasSearchText = search.trim().length > 0;
  const highlightSearchIcon =
  hasSearchText || hasStartedRecording || isConvertingVoiceToText;
  const rotatingTexts = t("search.searchRotatingTexts", {
  returnObjects: true,
});

const [currentTextIndex, setCurrentTextIndex] = useState(0);
const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 640);

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    if (isMobile) {
      setCurrentTextIndex((prev) => (prev + 1) % (rotatingTexts.length + 1));
    } else {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }
  }, 2000);

  return () => clearInterval(interval);
}, [rotatingTexts, isMobile]);

  useEffect(() => {
    if (hasStartedRecording) {
      intervalIdRef.current = setInterval(() => {
        setSeconds((prev) => +(prev + 0.1).toFixed(1));
      }, 100);
    } else {
      clearInterval(intervalIdRef.current);
    }

    return () => clearInterval(intervalIdRef.current);
  }, [hasStartedRecording]);

  const syncSearchParam = (value) => {
    if (
      typeof window === "undefined" ||
      !window.location.pathname.endsWith("/resources")
    ) {
      return;
    }

    const next = new URLSearchParams(searchParams.toString());
    const trimmedValue = value.trim();

    if (trimmedValue) {
      next.set("searchResourceText", trimmedValue);
    } else {
      next.delete("searchResourceText");
    }

    next.delete("searchText");

    if (trimmedValue) {
      setSearchParams(next, { replace: true });
    } else {
      const nextSearch = next.toString();
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`
      );
      setSearchParams(next, { replace: true });
    }
  };

  const submitSearch = (value) => {
    const trimmedSearch = value.trim();
    if (!trimmedSearch || loadingList) return;

    setGlobalSearch(trimmedSearch);
    if (onSearch) {
      onSearch(trimmedSearch);
    } else {
      syncSearchParam(trimmedSearch);
      scrollToBrowseResources();
    }
  };

  const handleSendMessage = (event) => {
    event?.preventDefault();
    submitSearch(search);
  };

  const handleOnInputText = (value) => {
    if (loadingList) return;

    setSearchInput(value);
    if (value.trim() === "") {
      syncSearchParam("");
      setGlobalSearch("");
    }
  };

  const startRecording = () => {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      console.warn("getUserMedia not supported on your browser!");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        try {
          const recorder = new MediaRecorder(stream, {
            mimeType: "audio/webm;codecs=opus",
            audioBitsPerSecond: 16000,
          });
          const localAudioChunks = [];

          setMediaRecorder(recorder);
          setSeconds(0);
          recorder.start();
          setHasStartedRecording(true);

          recorder.ondataavailable = (event) => {
            localAudioChunks.push(event.data);
          };

          recorder.onstop = async () => {
            setHasStartedRecording(false);
            stream.getTracks().forEach((track) => track.stop());

            if (localAudioChunks.length === 0) {
              console.warn("No audio chunks were recorded.");
              setIsConvertingVoiceToText(false);
              return;
            }

            const audioBlob = new Blob(localAudioChunks, {
              type: "audio/webm;codecs=opus",
            });
            const isSilent = await isSilentAudio(audioBlob, 0.02);

            if (!audioBlob || isSilent) {
              showNotification({
                message: t("asrError"),
                type: "error",
                options: {
                  position: "top-center",
                  autoClose: 6000,
                  style: { fontWeight: "bold" },
                },
              });
              setIsConvertingVoiceToText(false);
              return;
            }

            setIsConvertingVoiceToText(true);
            const s3Url = await handleS3Upload(
              audioBlob,
              `${Date.now()}`,
              `chatbot/companychat/${sessionId}/`
            );

            if (!s3Url || s3Url === "") {
              showNotification({
                message: t("asrError"),
                type: "error",
                options: {
                  position: "top-center",
                  autoClose: 6000,
                  style: { fontWeight: "bold" },
                },
              });
            } else {
              const transcriptResult = await ai4BharatASRApi(
                s3Url,
                languageToUse,
                bot_routes.search_bot
              );

              if (!transcriptResult || transcriptResult === "") {
                showNotification({
                  message: t("asrError"),
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 6000,
                    style: { fontWeight: "bold" },
                  },
                });
              } else {
                setSearchInput(transcriptResult);
                submitSearch(transcriptResult);
              }
            }

            setIsConvertingVoiceToText(false);
          };
        } catch (err) {
          console.error("MediaRecorder not supported:", err);
          setIsConvertingVoiceToText(false);
        }
      })
      .catch((err) => {
        console.error("Error accessing microphone:", err);
        setIsConvertingVoiceToText(false);
      });
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
  };

const clearSearch = () => {
  syncSearchParam("");
  setSearchInput("");
  setGlobalSearch("");
};

return (
  <form
    onSubmit={handleSendMessage}
    className={`flex flex-row flex-nowrap items-center bg-white ${
      isHeader
        ? "gap-1 rounded-xl px-3 py-4 w-full max-w-[44rem]"
        : "gap-3 h-[4.1rem] w-full max-w-[43.9rem] rounded-[0.563rem] px-4"
    } shadow-[0px_4px_12px_rgba(0,0,0,0.08)] ${className}`}
  >
<img
  src={SearchIcon}
  alt={t("search.searchIconAlt")}
  className={`w-[1.6rem] h-[1.6rem] flex-shrink-0 transition-all duration-200 ${
    highlightSearchIcon ? "text-[var(--listing-primary)]" : ""
  }`}
/>

    <div className="relative flex-1">
      {!search.trim() && !hasStartedRecording && !isConvertingVoiceToText && (
        <div
  className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center overflow-hidden"
  style={{
    paddingRight: isMobile ? "5.5rem" : "0",
  }}
>
  {isMobile ? (
    <span
      className={`${
        currentTextIndex === 0
          ? "font-bold text-[var(--listing-text-bold)]"
          : "font-normal text-[var(--listing-text-normal)]"
      } whitespace-nowrap transition-all duration-300`}
      style={{
        fontFamily: "Manrope",
        fontSize: "1rem",
        lineHeight: "1.5rem",
      }}
    >
      {currentTextIndex === 0
        ? t("search.searchBarContent")
        : rotatingTexts[currentTextIndex - 1]}
    </span>
  ) : (
    <>
      <span
        className="font-bold text-[var(--listing-text-bold)]"
        style={{
          fontFamily: "Manrope",
          fontSize: "1rem",
          lineHeight: "1.5rem",
        }}
      >
        {t("search.searchBarContent")}
      </span>

      <span
        className="font-normal text-[var(--listing-text-normal)] ml-1"
        style={{
          fontFamily: "Manrope",
          fontSize: "1rem",
          lineHeight: "1.5rem",
        }}
      >
        {rotatingTexts[currentTextIndex]}
      </span>
    </>
  )}
</div>
      )}

      <input
        value={search}
        onChange={(e) => handleOnInputText(e.target.value)}
        placeholder={
          hasStartedRecording
            ? t("search.recording", { seconds: seconds.toFixed(1) })
            : isConvertingVoiceToText
            ? t("search.convertingVoice")
            : ""
        }
        className={`w-full bg-transparent outline-none text-[var(--listing-strong-text)] ${
          isHeader ? "text-[0.8rem]" : "text-[0.9rem]"
        }`}
      />
    </div>

    {/* Clear button */}
{search.trim() && !hasStartedRecording && (
  <button
    type="button"
    onClick={clearSearch}
    className="flex h-[1.8rem] w-[1.8rem] items-center justify-center flex-shrink-0"
    aria-label={t("search.clearSearch")}
  >
    <img
      src={ClearIcon}
      alt={t("search.clearIconAlt")}
      className="w-[1.1rem] h-[1.1rem]"
    />
  </button>
)}

{/* Mic button */}
<button
  type="button"
  onClick={hasStartedRecording ? stopRecording : startRecording}
  className={`flex items-center justify-center flex-shrink-0 rounded-full transition-all duration-200 ${
    hasStartedRecording
      ? "h-[2.2rem] w-[2.2rem] bg-[var(--listing-primary)]"
      : hasSearchText
      ? "h-[2.2rem] w-[2.2rem]"
      : "h-[1.8rem] w-[1.8rem]"
  }`}
  aria-label={
    hasStartedRecording
      ? t("search.stopVoiceSearch")
    : t("search.startVoiceSearch")
  }
>
<img
  src={MicIcon}
  alt={t("search.microphoneAlt")}
  className={`w-[1.5rem] h-[1.5rem] transition-all duration-200 ${
    hasStartedRecording
      ? "w-[1rem] h-[1rem] brightness-0 invert"
      : hasSearchText
      ? "brightness-0"
      : ""
  }`}
/>
</button>

<button
  type="submit"
  disabled={disableSendButton}
  className={`flex h-[2.2rem] w-[2.2rem] items-center justify-center flex-shrink-0 rounded-full transition-all duration-200 ${
    hasSearchText ? "bg-[var(--listing-primary)]" : "bg-transparent"
  } ${
    disableSendButton ? "opacity-50 cursor-not-allowed" : ""
  }`}
  aria-label={t("search.searchResources")}
>
  <img
  src={SendIcon}
  alt={t("search.sendIconAlt")}
  className={`transition-all duration-200 ${
    hasSearchText
      ? "w-[1.45rem] h-[1.45rem] brightness-0 invert"
      : "w-[1.45rem] h-[1.45rem]"
  }`}
/>
</button>
  </form>
);
}
