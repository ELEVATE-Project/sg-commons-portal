import React, { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { IoMicOutline } from "react-icons/io5";
import { FaRegStopCircle } from "react-icons/fa";
import { LuSend } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { useSiteDataLocalStore } from "store";
import { useChatStorage } from "hooks/useStorage";
import { useRepositoryStore } from "../../pages/shikshagraha-repository/repository-hooks/useRepositoryStore";
import { showNotification } from "../ToastMessage/TotastMessage";
import { handleS3Upload } from "../../services/storage_service";
import { ai4BharatASRApi } from "api/endpoints/ai";
import { isSilentAudio } from "../../utils/helpers";
import { bot_routes } from "configure";

const scrollToBrowseResources = () => {
  const browseSection = document.querySelector("[data-browse-resources]");
  if (browseSection) {
    browseSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export default function RepositorySearch({ variant = "hero", className = "" }) {
  const { t } = useTranslation();
  const search = useRepositoryStore((state) => state.searchInput);
  const setGlobalSearch = useRepositoryStore((state) => state.setSearch);
  const setSearchInput = useRepositoryStore((state) => state.setSearchInput);
  const loadingList = useRepositoryStore((state) => state.loadingList);

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

  const submitSearch = (value) => {
    const trimmedSearch = value.trim();
    if (!trimmedSearch || loadingList) return;

    setGlobalSearch(trimmedSearch);
    scrollToBrowseResources();
  };

  const handleSendMessage = (event) => {
    event?.preventDefault();
    submitSearch(search);
  };

  const handleOnInputText = (value) => {
    if (loadingList) return;

    setSearchInput(value);
    if (value.trim() === "") {
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

return (
  <form
    onSubmit={handleSendMessage}
    className={`flex flex-row flex-nowrap items-center bg-white ${
      isHeader
        ? "gap-1 rounded-xl px-3 py-4 w-full max-w-[44rem]"
        : "gap-3 h-[4.1rem] w-full max-w-[43.9rem] rounded-[9px] px-4"
    } shadow-[0px_4px_12px_rgba(0,0,0,0.08)] ${className}`}
  >
    <Search
      className="w-[1.6rem] h-[1.6rem] flex-shrink-0"
      style={{ color: "#8B3BB8" }}
    />

    <div className="relative flex-1">
      {!search.trim() && !hasStartedRecording && !isConvertingVoiceToText && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">

          <span
            className="font-bold text-[#4B5563]"
            style={{
              fontFamily: "Manrope",
              fontSize: "1rem",
              lineHeight: "1.5rem",
            }}
          >
            AI Search for
          </span>

          <span
            className="font-normal text-[#6B7280] ml-1 hidden sm:inline"
            style={{
              fontFamily: "Manrope",
              fontSize: "1rem",
              lineHeight: "1.5rem",
            }}
          >
            content across Commons
          </span>

          <span className="ml-1 text-[#4B5563] sm:hidden">...</span>

        </div>
      )}

      <input
        value={search}
        onChange={(e) => handleOnInputText(e.target.value)}
        placeholder={
          hasStartedRecording
            ? `Recording... ${seconds.toFixed(1)}s`
            : isConvertingVoiceToText
            ? "Converting voice to text..."
            : ""
        }
        className={`w-full bg-transparent outline-none text-[#111827] ${
          isHeader ? "text-[0.8rem]" : "text-[0.9rem]"
        }`}
      />
    </div>

    <button
      type="button"
      onClick={hasStartedRecording ? stopRecording : startRecording}
      className="flex h-[1.6rem] w-[1.6rem] items-center justify-center flex-shrink-0"
      aria-label={
        hasStartedRecording
          ? "Stop voice search"
          : "Start voice search"
      }
    >
      {hasStartedRecording ? (
        <FaRegStopCircle className="w-[1.2rem] h-[1.2rem] text-red-500" />
      ) : (
        <IoMicOutline className="w-[1.9rem] h-[1.9rem] text-[#000000]" />
      )}
    </button>

  <button
  type="submit"
  disabled={disableSendButton}
  className={`flex h-[1.6rem] w-[1.6rem] items-center justify-center flex-shrink-0 ${
    disableSendButton ? "opacity-50 cursor-not-allowed" : ""
  }`}
  aria-label="Search resources"
>
  <LuSend
   size={23}
  color="#000000"
  strokeWidth={2.23}
  />
</button>
  </form>
);
}
