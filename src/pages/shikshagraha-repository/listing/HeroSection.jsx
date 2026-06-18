import React from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { IoMicOutline } from "react-icons/io5";
import { FaRegStopCircle } from "react-icons/fa";
import { TbSend2 } from "react-icons/tb";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore";
import { useSiteDataLocalStore } from "store";
import { useChatStorage } from "hooks/useStorage";
import Notification, { showNotification } from "../../../components/ToastMessage/TotastMessage";
import { handleS3Upload } from "../../../services/storage_service";
import { ai4BharatASRApi } from "api/endpoints/ai";
import { isSilentAudio } from "../../../utils/helpers";
import { bot_routes } from "configure";
import left1 from "../../../assets/hero-section-image-1.svg";
import left2 from "../../../assets/hero-section-image-2.svg";
import right1 from "../../../assets/hero-section-image-3.svg";
import right2 from "../../../assets/hero-section-image-4.svg";

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
            Open-access
          </span>

          <span className="px-4 py-1 rounded-full border border-white/30 text-white text-sm font-light bg-gray-700/40">
            CC BY-SA
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
          Discover. Learn. Reuse. Build.
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
          A curated knowledge repository of solutions, resources and assets for
          education leaders working to strengthen India's public schools.
        </p>

        {/* Search Form */}
        <form
          onSubmit={handleSendMessage}
          className="
            flex
            flex-row
            flex-nowrap
            items-center
            gap-2
            bg-white
            rounded-2xl
            px-5
            py-4
            w-full
            max-w-[760px]
            shadow-xl
          "
        >
          {/* Search Icon */}
          <Search className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--listing-primary)' }} />

          {/* Input */}
          <input
            value={search}
            onChange={e => {
              if (loadingList) return;
              handleOnInputText(e.target.value);
            }}
            placeholder={
              hasStartedRecording
                ? `Recording... ${seconds.toFixed(1)}s`
                : isConvertingVoiceToText
                ? "Converting voice to text..."
                : "AI Search for content across Commons"
            }
            className="
              flex-1
              min-w-0
              bg-transparent
              px-3
              py-2
              outline-none
              text-gray-700
              text-[18px]
              placeholder-gray-500
            "
          />

          {/* MIC */}
          <button
            type="button"
            onClick={hasStartedRecording ? stopRecording : startRecording}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition flex-shrink-0"
            aria-label="Start voice search"
          >
            {hasStartedRecording ? (
              <FaRegStopCircle className="w-5 h-5 text-red-500" />
            ) : (
              <IoMicOutline className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {/* SEND */}
          <button
            type="submit"
            disabled={disableSendButton}
            className={`flex items-center justify-center h-10 w-10 rounded-xl transition flex-shrink-0 hover:opacity-90 ${
              disableSendButton ? 'cursor-not-allowed' : ''
            }`}
            style={{ backgroundColor: disableSendButton ? 'var(--listing-disabled)' : 'var(--listing-primary)' }}
          >
            <TbSend2 className="w-5 h-5 text-white" />
          </button>
        </form>

        {/* Scroll */}
        <div className="mt-8 text-white/80">
          <p>Scroll down</p>
          <div className="animate-bounce text-2xl">⌄</div>
        </div>

      </div>
    </div>
  </div>
);
}
