import React from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { IoMicOutline } from "react-icons/io5";
import { FaRegStopCircle } from "react-icons/fa";
import { TbSend2 } from "react-icons/tb";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore";
import heroImg from "../../../assets/background-image.png";
import { useSiteDataLocalStore } from "store";
import { useChatStorage } from "hooks/useStorage";
import Notification, { showNotification } from "../../../components/ToastMessage/TotastMessage";
import { handleS3Upload } from "../../../services/storage_service";
import { ai4BharatASRApi } from "api/endpoints/ai";
// import { formatTime, isSilentAudio } from "pages/ShikshalokamVoiceChat/voiceToText";
import { bot_routes } from "configure";

export default function HeroSection() {
  const { t } = useTranslation();

  const search = useRepositoryStore((state) => state.searchInput);
  const setGlobalSearch = useRepositoryStore((state) => state.setSearch);
  const setSearchInput = useRepositoryStore((state) => state.setSearchInput);
  const loadingList = useRepositoryStore((state) => state.loadingList);
  const [mediaRecorder, setMediaRecorder] = React.useState(null);
  const [hasStartedRecording, setHasStartedRecording] = React.useState(false);
  const [isConvertingVoiceToText, setIsConvertingVoiceToText] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const [intervalId, setIntervalId] = React.useState(null);

  const languageToUse = useSiteDataLocalStore(state => state.chatLanguage);
  const sessionId = useChatStorage()(state => state.sessionId);

  React.useEffect(() => {
    if (hasStartedRecording) {
      const id = setInterval(() => {
        setSeconds(prev => prev + 0.1);
      }, 100);
      setIntervalId(id);
    } else {
      clearInterval(intervalId);
      setSeconds(0);
    }

    return () => clearInterval(intervalId);
  }, [hasStartedRecording]);

  const disableSendButton =
    search.trim().length === 0 || hasStartedRecording || loadingList || isConvertingVoiceToText;

  const handleSendMessage = e => {
    e?.preventDefault();

    if (loadingList) return;

    if (!search.trim()) return;

    if (search.length > 3) {
      setGlobalSearch(search);
      // Scroll to Browse Resources section smoothly after search
      const browseSection = document.querySelector('[data-browse-resources]');
      if (browseSection) {
        browseSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleOnInputText = value => {
    if (loadingList) return; 
    setSearchInput(value);

    if (value.trim() === "") {
      setGlobalSearch("");
    }
  };

  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          try {
            const options = {
              mimeType: "audio/webm;codecs=opus",
              audioBitsPerSecond: 16000,
            }
            const recorder = new MediaRecorder(stream, options)
            setMediaRecorder(recorder)

            const localAudioChunks = []

            recorder.start()
            setHasStartedRecording(true)

            recorder.ondataavailable = event => {
              localAudioChunks.push(event.data)
            }

            recorder.onstop = async () => {
              setHasStartedRecording(false)
              if (localAudioChunks.length > 0) {
                const audioBlob = new Blob(localAudioChunks, {
                  type: "audio/webm;codecs=opus",
                })
                const isSilent = await isSilentAudio(audioBlob, 0.02)

                if (!audioBlob || isSilent) {
                  showNotification({
                    message: t("asrError"),
                    type: "error",
                    options: {
                      position: "top-center",
                      autoClose: 6000,
                      style: { fontWeight: "bold" },
                    },
                  })
                  return
                }

                setIsConvertingVoiceToText(true)
                let transcriptResult = ""
                const s3Url = await handleS3Upload(audioBlob, `${Date.now()}`, `chatbot/companychat/${sessionId}/`)
                if (!s3Url || s3Url === "") {
                  showNotification({
                    message: t("asrError"),
                    type: "error",
                    options: {
                      position: "top-center",
                      autoClose: 6000,
                      style: { fontWeight: "bold" },
                    },
                  })
                } else {
                  const storedRoute = bot_routes.search_bot
                  transcriptResult = await ai4BharatASRApi(s3Url, languageToUse, storedRoute)

                  if (!transcriptResult || transcriptResult === "") {
                    showNotification({
                      message: t("asrError"),
                      type: "error",
                      options: {
                        position: "top-center",
                        autoClose: 6000,
                        style: { fontWeight: "bold" },
                      },
                    })
                  } else {
                    setSearchInput(transcriptResult)
                    setGlobalSearch(transcriptResult)
                    const browseSection = document.querySelector('[data-browse-resources]')
                    if (browseSection) {
                      browseSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }
                }
                setIsConvertingVoiceToText(false)
              } else {
                console.warn("No audio chunks were recorded.")
                setIsConvertingVoiceToText(false)
              }
            }
          } catch (err) {
            console.error("MediaRecorder not supported:", err)
            setIsConvertingVoiceToText(false)
          }
        })
        .catch(err => {
          console.error("Error accessing microphone:", err)
          setIsConvertingVoiceToText(false)
        })
    } else {
      console.warn("getUserMedia not supported on your browser!")
    }
  }

  const stopRecording = () => {
    mediaRecorder?.stop();
  };

  return (
    <div
      className="relative w-full overflow-hidden mt-4 min-h-[50vh] sm:min-h-[55vh] md:min-h-[60vh] lg:min-h-[65vh] xl:min-h-[70vh]"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${heroImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center text-center">
        <div className="flex w-full max-w-4xl flex-col items-center gap-4">
        <h1 className="text-lg md:text-3xl text-white font-semibold">
          {t("heroTitle")}
        </h1>

        <p className="text-white text-sm md:text-lg">
          {t("heroDescription")}
        </p>

        <form
          onSubmit={handleSendMessage}
          className="flex flex-row flex-nowrap items-center gap-2 bg-[var(--listing-surface)] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 w-full max-w-2xl shadow-sm"
        >
          {/* Search Icon */}
          <Search className="w-5 h-5 text-[var(--listing-subdued-text)] flex-shrink-0" />

          {/* Input */}
            <input
              value={search}
              onChange={e => {
                if (loadingList) return; // 👈 ADD THIS
                handleOnInputText(e.target.value);
              }}
              placeholder={hasStartedRecording ? `Recording... ${seconds.toFixed(1)}s` : isConvertingVoiceToText ? "Converting voice to text..." : "Search with AI"}
              className="flex-1 min-w-0 bg-transparent px-3 py-2 sm:px-4 sm:py-2 outline-none text-[var(--listing-muted-text)] placeholder-[var(--listing-subdued-text)]"
            />

          {/* MIC */}
          <button
            type="button"
            onClick={hasStartedRecording ? stopRecording : startRecording}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--listing-surface)] hover:bg-[var(--listing-surface-hover)] transition flex-shrink-0"
          >
            {hasStartedRecording ? (
              <FaRegStopCircle className="w-5 h-5 text-[var(--listing-danger)]" />
            ) : (
              <IoMicOutline className="w-5 h-5 text-[var(--listing-icon-mid)]" />
            )}
          </button>

          {/* SEND */}
          <button
            type="submit"
            disabled={disableSendButton}
            className={`flex items-center justify-center h-10 w-10 rounded-xl transition flex-shrink-0 ${
              disableSendButton
                ? "bg-[var(--listing-disabled)]"
                : "bg-[var(--listing-secondary)] hover:bg-[var(--listing-secondary-hover)]"
            }`}
          >
            <TbSend2 className="w-5 h-5 text-white" />
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
