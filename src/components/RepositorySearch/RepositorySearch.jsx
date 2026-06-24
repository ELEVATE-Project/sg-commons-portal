import React, { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { IoMicOutline } from "react-icons/io5";
import { FaRegStopCircle } from "react-icons/fa";
import { TbSend2 } from "react-icons/tb";
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
        className={`flex flex-row flex-nowrap items-center bg-white shadow-xl ${
          isHeader
          ? "gap-1 rounded-xl px-3 py-2 w-full max-w-[44rem]"
          : "gap-2 rounded-2xl px-5 py-4 w-full max-w-[760px]"
      } ${className}`}
    >
      <Search
        className={`${isHeader ? "w-5 h-5" : "w-6 h-6"} flex-shrink-0`}
        style={{ color: "var(--listing-primary)" }}
      />

      <input
        value={search}
        onChange={(event) => handleOnInputText(event.target.value)}
        placeholder={
          hasStartedRecording
            ? `Recording... ${seconds.toFixed(1)}s`
            : isConvertingVoiceToText
            ? "Converting voice to text..."
            : "AI Search for content across Commons"
        }
        className={`flex-1 min-w-0 bg-transparent outline-none text-gray-700 placeholder-gray-500 ${
          isHeader ? "px-2 py-1 text-[0.875rem]" : "px-3 py-2 text-[18px]"
        }`}
      />

      <button
        type="button"
        onClick={hasStartedRecording ? stopRecording : startRecording}
        className="flex h-8 w-8 items-center justify-center rounded-xl transition flex-shrink-0"
        aria-label={hasStartedRecording ? "Stop voice search" : "Start voice search"}
      >
        {hasStartedRecording ? (
          <FaRegStopCircle className="w-5 h-5 text-red-500" />
        ) : (
          <IoMicOutline className="w-5 h-5 text-gray-500" />
        )}
      </button>

      <button
        type="submit"
        disabled={disableSendButton}
        className={`flex items-center justify-center rounded-xl transition flex-shrink-0 hover:opacity-90 ${
          isHeader ? "h-8 w-8" : "h-10 w-10"
        } ${disableSendButton ? "cursor-not-allowed" : ""}`}
        style={{
          backgroundColor: disableSendButton
            ? "var(--listing-disabled)"
            : "var(--listing-primary)",
        }}
        aria-label="Search resources"
      >
        <TbSend2 className={`${isHeader ? "w-4 h-4" : "w-5 h-5"} text-white`} />
      </button>
    </form>
  );
}
