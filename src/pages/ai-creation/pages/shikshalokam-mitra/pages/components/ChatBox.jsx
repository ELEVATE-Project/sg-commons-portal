import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaRegStopCircle } from "react-icons/fa";
import { TbSend2 } from "react-icons/tb";
import { FaCircle } from "react-icons/fa6";
import { IoMicOutline } from "react-icons/io5";
import { handleS3Upload } from "../../../../../../services/storage_service";
import { ai4BharatASRApi } from "../../../../../../api/endpoints/ai";
import { showNotification } from "../../../../../../components/ToastMessage/TotastMessage";
import { useAICreationSessionStore } from "../../../../../../store";
import { useSiteDataSessionStore } from "../../../../../../store";

const formatTime = (secs) => {
  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

const isSilentAudio = async (blob, silenceThreshold = 0.01) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const rawData = audioBuffer.getChannelData(0);

  const rms = Math.sqrt(
    rawData.reduce((acc, val) => acc + val * val, 0) / rawData.length
  );
  console.log("RMS (volume):", rms);

  return rms < silenceThreshold;
};

function ChatBox({
  textInputRef,
  textMessage,
  handleOnInputText,
  setUseTextbox,
  placeholder,
  autoFocus = false,
  handleSendMessage,
  styles = {},
  disabled = false,
  isReadOnly = false,
  isCommonFlow = false,
}) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  
  // Recording state - now internal to ChatBox
  const [hasStartedRecording, setHasStartedRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const intervalIdRef = useRef(null);
  const [seconds, setSeconds] = useState(0);
  const [isFetchingData, setIsFetchingData] = useState(false);
  
  const sessionRoute = "/guided_guest";
  const languageToUse = useSiteDataSessionStore().getChatLanguage() || "en";

  const {
    formStyles = "",
    inputStyles = "",
    voiceButtonStyles = "",
    sendButtonStyles = "",
  } = styles;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Timer effect for recording
  useEffect(() => {
    if (hasStartedRecording) {
      const id = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
      intervalIdRef.current = id;
    } else {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
      setSeconds(0);
    }

    return () => clearInterval(intervalIdRef.current);
  }, [hasStartedRecording]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      clearInterval(intervalIdRef.current);
    };
  }, []);

  useEffect(() => {
  if (textInputRef?.current && !disabled && !isReadOnly) {
    textInputRef.current.focus();
  }
  }, [autoFocus, disabled, isReadOnly]);

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setHasStartedRecording(false);
    }
  };

  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Clear any existing text
      if (handleOnInputText) {
        handleOnInputText({ target: { value: "" }, preventDefault: () => {} });
      }
      
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const options = {
            mimeType: "audio/webm;codecs=opus",
            audioBitsPerSecond: 16000,
          };
          const recorder = new MediaRecorder(stream, options);
          mediaRecorderRef.current = recorder;

          const localAudioChunks = [];

          recorder.start();
          setHasStartedRecording(true);

          recorder.ondataavailable = (event) => {
            localAudioChunks.push(event.data);
          };

          recorder.onstop = async () => {
            // Stop all tracks to release microphone
            stream.getTracks().forEach(track => track.stop());
            
            if (localAudioChunks.length > 0) {
              const audioBlob = new Blob(localAudioChunks, {
                type: "audio/webm;codecs=opus",
              });
              const isSilent = await isSilentAudio(audioBlob, 0.02);


              if (!audioBlob || isSilent) {
                showNotification({
                  message: t("common.failedToCaptureSpeech"),
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 6000,
                    style: { fontWeight: "bold", width: "80%" },
                  },
                });
                return;
              }

              setIsFetchingData(true);
              let transcriptResult = "";
              const sessionId = useAICreationSessionStore.getState().getSession();

              try {
                let s3Url = await handleS3Upload(
                  audioBlob,
                  `${Date.now()}`,
                  `chatbot/companychat/${sessionId}/`,
                  null
                );
                
                if (!s3Url || s3Url === "") {
                  transcriptResult = t("common.failedToCaptureSpeech");
                } else {
                  transcriptResult = await ai4BharatASRApi(
                    s3Url,
                    languageToUse,
                    sessionRoute
                  );
                }

                if (!transcriptResult || transcriptResult === "") {
                  showNotification({
                    message: t("common.failedToCaptureSpeech"),
                    type: "error",
                    options: {
                      position: "top-center",
                      autoClose: 6000,
                      style: { fontWeight: "bold" },
                    },
                  });
                } else {
                  // Update text message with transcription
                  if (handleOnInputText) {
                    handleOnInputText({ 
                      target: { value: transcriptResult }, 
                      preventDefault: () => {} 
                    });
                    setTimeout(() => {
                      adjustTextareaHeight();
                    }, 0);
                  }
                }
              } catch (error) {
                console.error("Error processing audio:", error);
                showNotification({
                  message: t("common.failedToCaptureSpeech"),
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 6000,
                    style: { fontWeight: "bold" },
                  },
                });
              } finally {
                setIsFetchingData(false);
              }
            } else {
              console.warn("No audio chunks were recorded.");
              setIsFetchingData(false);
            }
          };
        })
        .catch((err) => {
          console.error("Error accessing microphone:", err);
          setIsFetchingData(false);
          showNotification({
            message: t("common.microphoneAccessDenied") || "Microphone access denied",
            type: "error",
            options: {
              position: "top-center",
              autoClose: 6000,
              style: { fontWeight: "bold" },
            },
          });
        });
    } else {
      console.warn("getUserMedia not supported on your browser!");
      showNotification({
        message: t("common.browserNotSupported") || "Browser not supported",
        type: "error",
        options: {
          position: "top-center",
          autoClose: 6000,
          style: { fontWeight: "bold" },
        },
      });
    }
  };

  const disableVoiceButton =
    (textMessage && textMessage?.trim()?.length > 0) || isFetchingData;
  const disableSendButton =
    !textMessage || textMessage?.trim()?.length === 0 || disabled;

  const shouldShowWhiteBg =
    isFocused || (textMessage && textMessage.length > 0);

  const inputPlaceholderText = useMemo(() => {
    if (isFetchingData) return t("common.placeholderProcessing");
    if (hasStartedRecording) return t("common.placeholderListening");
    if (placeholder) return placeholder;
    return t("common.chatPlaceholder");
  }, [hasStartedRecording, isFetchingData, placeholder, t]);

  function handleScrollToView() {
    // if (acceptedTnc === "ONGOING") return
    try {
      document?.querySelector("#last-chat-boundary")?.scrollIntoView({
        behavior: "smooth",
      })
    } catch (error) {
      console.error({ error })
    }
  }

  const resetTextareaHeight = () => {
    if (textInputRef?.current) {
      textInputRef.current.style.height = "1.5rem"
      textInputRef.current.style.overflowY = "hidden"
    }
  }

  const adjustTextareaHeight = () => {
    if (!textInputRef?.current) return
    
    const el = textInputRef.current
    const minHeight = 24
    const maxHeight = 100
    
    el.style.height = "auto"
    
    if (!el.value) {
      el.style.height = `${minHeight}px`
      el.style.overflowY = "hidden"
      return
    }
    
    const nextHeight = Math.min(el.scrollHeight, maxHeight)
    el.style.height = `${nextHeight}px`
    el.style.overflowY = nextHeight >= maxHeight ? "auto" : "hidden"
  }

  return (
    <>
      <style>{`
        #chat-box-textarea::-webkit-scrollbar {
          width: 0.25rem;
        }
        #chat-box-textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        #chat-box-textarea::-webkit-scrollbar-thumb {
          background: #AAAAAA;
          border-radius: 0.125rem;
        }
        #chat-box-textarea::-webkit-scrollbar-thumb:hover {
          background: #888888;
        }
        /* Firefox */
        #chat-box-textarea {
          scrollbar-width: thin;
          scrollbar-color: #AAAAAA transparent;
        }
      `}</style>
      <form onSubmit={(e) => {
        resetTextareaHeight();
        handleSendMessage(e);
      }} autoComplete="off" className={`cursor-pointer flex items-center gap-[0.625rem] h-full overflow-y-auto border border-[#DDDDDD] py-2 md:py-3 px-4 mx-auto w-full md:w-[80%] lg:w-[70%] ${shouldShowWhiteBg ? "bg-white" : "bg-[#F0F2F5]"} ${textMessage?.includes("\n") ? "rounded-3xl" : "rounded-[3.125rem]"} ${formStyles}`}>
        <textarea
          ref={textInputRef}
          id="chat-box-textarea"
          value={textMessage}
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={inputPlaceholderText}
          onChange={handleOnInputText}
          onInput={e => {
            const el = e.target
            const minHeight = 24
            const maxHeight = 100
          
            el.style.height = "auto"
          
            // Empty → reset
            if (!el.value) {
              el.style.height = `${minHeight}px`
              el.style.overflowY = "hidden"
              return
            }

          
            // Only grow when content actually overflows current height
            if (el.scrollHeight > el.clientHeight) {
              const nextHeight = Math.min(el.scrollHeight, maxHeight)
              el.style.height = `${nextHeight}px`
              el.style.overflowY = nextHeight >= maxHeight ? "auto" : "hidden"
            }
            else if (el.scrollHeight === el.clientHeight) {
              el.style.height = `${minHeight+20}px`
              el.style.overflowY = "hidden"
            }
            else {
              el.style.height = `${minHeight}px`
              el.style.overflowY = "hidden"
            }
          }}
          onKeyDown={async e => {
            if (e.key === "Enter" && e.shiftKey) {
              try {
                e.preventDefault()
                e.target.form.requestSubmit()
                setTimeout(() => {
                  e.target.value = ""
                }, 0)
              } catch (error) {
                console.error("Error handling text:", error)
              } finally {
                setUseTextbox(false)
              }
            }
          }}
          className="
    w-[90%]
    h-[1.5rem]
    max-h-[9.375rem]
    resize-none
    overflow-y-auto
    overflow-x-hidden
    bg-transparent
    border-0
    outline-none
    focus:outline-none
    text-xs
    md:text-base
    font-normal
    leading-normal
    text-[#101010]
    placeholder:text-xs
    md:placeholder:text-base
    placeholder:font-normal
    placeholder:text-[#AAAAAA]
    disabled:bg-slate-200
    disabled:text-slate-500
    scrollbar-thin
    scrollbar-thumb-slate-400
    scrollbar-track-transparent
  "
        />

        {hasStartedRecording && (
          <div className="flex items-center space-x-1 text-red-600 text-sm font-medium pointer-events-none">
            <FaCircle className="text-red-500 animate-pulse w-[0.625rem] h-[0.625rem] text-xs" />
            <span>{formatTime(seconds)}</span>
          </div>
        )}
        {!isReadOnly && (
          <button
            type="button"
            disabled={disableVoiceButton}
            className={`${hasStartedRecording ? "text-red-500" : "text-black"} disabled:text-[#64748b] disabled:cursor-not-allowed cursor-pointer ${voiceButtonStyles}`}
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              if (hasStartedRecording) {
                stopRecording()
              } else {
                startRecording()
              }
            }}
          >
            {hasStartedRecording ? <FaRegStopCircle className="w-[1rem] h-[1rem] md:w-[1.25rem] md:h-[1.25rem] lg:w-[1.5rem] lg:h-[1.5rem]" /> : <IoMicOutline className="w-[1.25rem] h-[1.25rem] md:w-[1.5rem] md:h-[1.5rem] lg:w-[1.75rem] lg:h-[1.75rem]" />}
          </button>
        )}
        <button disabled={disableSendButton} type="submit" className={`disabled:cursor-not-allowed disabled:text-[#64748b] cursor-pointer ${!disableSendButton ? "text-[#007BFF]" : ""} ${sendButtonStyles}`}>
          <TbSend2 className="w-[1.375rem] h-[1.375rem] lg:w-[1.625rem] lg:h-[1.625rem]" />
        </button>
      </form>
    </>
  )
}

export default ChatBox;
