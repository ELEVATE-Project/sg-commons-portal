import React, { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { useTranslation } from "react-i18next"
import { theme } from "../../../theme"
import Select, { components } from "react-select"
import { Search, X, Filter } from "lucide-react"
/** Icons */
import { FaCircle } from "react-icons/fa6"
import { IoMicOutline } from "react-icons/io5"
import { FaRegStopCircle } from "react-icons/fa"
// removed unused send icon import
/** Hooks OR Stores */
import { useSiteDataLocalStore } from "store"
import { useAudio } from "hooks/useAudio"
import { useChatStorage } from "hooks/useStorage"
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore"
import useVoiceRecord from "../../../hooks/useVoiceRecord"
/** Components */
import Notification, { showNotification } from "../../../components/ToastMessage/TotastMessage"
/** Services and Utilities */
import { handleS3Upload } from "../../../services/storage_service"
import { ai4BharatASRApi } from "api/endpoints/ai"
import { formatTime, isSilentAudio } from "../../../utils/helpers"
import { bot_routes } from "configure"

export default function Filters() {
  // removed unused `globalSearchValue`

  const filters = useRepositoryStore(state => state.filters)
  // fetch master list
  const fetchMasterList = useRepositoryStore(state => state.fetchMasterList)
  // get master list
  const dropdown_meta = useRepositoryStore(state => state.masterList)

  const resetFilters = useRepositoryStore(state => state.resetFilters)
  const clearTransientFiltersAtomic = useRepositoryStore(state => state.clearTransientFiltersAtomic)

  const setFilters = useRepositoryStore(state => state.setFilters)
  const setGlobalSearch = useRepositoryStore(state => state.setSearch)
  const setSearchInput = useRepositoryStore(state => state.setSearchInput)
  const search = useRepositoryStore(state => state.searchInput)
  const loadingList = useRepositoryStore(state => state.loadingList)

  const languageToUse = useSiteDataLocalStore(state => state.chatLanguage)
  const sessionId = useChatStorage()(state => state.sessionId)

  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [hasStartedRecording, setHasStartedRecording] = useState(false)
  // const [isConvertingVoiceToText, setIsFetchingData] = useState(false)
  const [isConvertingVoiceToText, setIsConvertingVoiceToText] = useState(false)

  const [seconds, setSeconds] = useState(0)
  const intervalIdRef = useRef(null)
  const [hasStartedListening, setHasStartedListening] = useState(false)

  const textAreaRef = useRef(null)
  const [isMaxLengthReached, setIsMaxLengthReached] = useState(false)

  const { HiddenRecorder } = useVoiceRecord()

  const { t } = useTranslation()

  const { audioRef } = useAudio()

  // const [debouncedSearch] = useDebounce(
  //   () => {
  //     if (!!search && search?.length > 3) {
  //       setGlobalSearch(search)
  //     }
  //   },
  //   500,
  //   [search]
  // )

  const [shouldScrollToTop, setShouldScrollToTop] = useState(false)

  const filtersRef = useRef(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const prevOverflowRef = useRef('')
  const prevPaddingRightRef = useRef('')
  const [queryMap, setQueryMap] = useState({})
  const [openMap, setOpenMap] = useState({})
  const [pendingFilters, setPendingFilters] = useState({})

  // sticky behavior removed: filters will remain in normal document flow

  useEffect(() => {
    if (!loadingList && shouldScrollToTop) {
      scrollToBrowseResources()
      setShouldScrollToTop(false)
    }
  }, [loadingList, shouldScrollToTop])

  function scrollToBrowseResources() {
    const browseSection = document.querySelector('[data-browse-resources]')
    if (browseSection) {
      browseSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function handleSendMessage(event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (loadingList) return;

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    if (!search.trim()) return

    if (!!search && search?.length > 0) {
      setGlobalSearch(search)
      scrollToBrowseResources()
    }
  }

  const handleChange = (key, value) => {
    setFilters({ [key]: value }, true)
    scrollToBrowseResources()
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setHasStartedRecording(false)
    }
  }

  const handleOnStopSpeaking = async () => {
    try {
      try {
        if (audioRef.current) await audioRef.current.pause()
      } catch (error) {
        console.error({ error })
      }
    } catch (error) {
      console.error({ error })
    }
  }

  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      handleOnStopSpeaking()
      setSearchInput("")
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
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
                setIsConvertingVoiceToText(false)
                return
              }

              setIsConvertingVoiceToText(true)
              try {
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
                  const transcriptResult = await ai4BharatASRApi(s3Url, languageToUse, bot_routes.search_bot)
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
                    scrollToBrowseResources()
                  }
                }
              } catch (err) {
                console.error(err)
                showNotification({
                  message: t("asrError"),
                  type: "error",
                  options: {
                    position: "top-center",
                    autoClose: 6000,
                    style: { fontWeight: "bold" },
                  },
                })
              } finally {
                setIsConvertingVoiceToText(false)
              }
            } else {
              console.warn("No audio chunks were recorded.")
              setIsConvertingVoiceToText(false)
            }
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

  const startSectionRecording = (sectionKey) => {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      console.warn("getUserMedia not supported on your browser!")
      return
    }
    // if another recorder is active, stop it first
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      return
    }
    handleOnStopSpeaking()
    setLocalFilterQuery(sectionKey, "")

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(async (stream) => {
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
            setMediaRecorder(null)
            stream.getTracks().forEach((t) => t.stop())
            if (localAudioChunks.length > 0) {
              const audioBlob = new Blob(localAudioChunks, {
                type: "audio/webm;codecs=opus",
              })
              const isSilent = await isSilentAudio(audioBlob, 0.02)

              if (!audioBlob || isSilent) {
                showNotification({
                  message: t("asrError"),
                  type: "error",
                  options: { position: "top-center", autoClose: 6000, style: { fontWeight: "bold" } },
                })
                setIsConvertingVoiceToText(false)
                return
              }

              setIsConvertingVoiceToText(true)
              try {
                const s3Url = await handleS3Upload(audioBlob, `${Date.now()}`, `chatbot/companychat/${sessionId}/`)
                if (!s3Url || s3Url === "") {
                  showNotification({
                    message: t("asrError"),
                    type: "error",
                    options: { position: "top-center", autoClose: 6000, style: { fontWeight: "bold" } },
                  })
                } else {
                  const storedRoute = bot_routes.search_bot
                  let transcriptResult = await ai4BharatASRApi(s3Url, languageToUse, storedRoute)
                  if (!transcriptResult || transcriptResult === "") {
                    showNotification({
                      message: t("asrError"),
                      type: "error",
                      options: { position: "top-center", autoClose: 6000, style: { fontWeight: "bold" } },
                    })
                  } else {
                    setLocalFilterQuery(sectionKey, transcriptResult)
                  }
                }
              } catch (err) {
                console.error(err)
                showNotification({
                  message: t("asrError"),
                  type: "error",
                  options: { position: "top-center", autoClose: 6000, style: { fontWeight: "bold" } },
                })
              } finally {
                setIsConvertingVoiceToText(false)
              }
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
  }
  const handleOnInputText = inpText => {
    setSearchInput(inpText) // Update store with current input value

    if (inpText.trim() === "") {
      setHasStartedListening(false)
if (inpText.trim() === "" && search.trim() !== "") {
      setGlobalSearch("")
       setShouldScrollToTop(true)
    }
     
    }
  }

  useEffect(() => {
    if (hasStartedRecording) {
      const id = setInterval(() => {
        setSeconds(prev => +(prev + 0.1).toFixed(1))
      }, 100)
      intervalIdRef.current = id
    } else {
      clearInterval(intervalIdRef.current)
      setSeconds(0)
    }

    return () => clearInterval(intervalIdRef.current)
  }, [hasStartedRecording])

  useEffect(() => {
    fetchMasterList()
    const searched_param = new URLSearchParams(window.location.search)?.get("q")
    setSearchInput(searched_param ?? "")
    setGlobalSearch(searched_param ?? "")
    return () => {
      setIsMaxLengthReached(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Prevent background scrolling when drawer is open and avoid layout shift by
  // preserving scrollbar space via padding-right.
  useEffect(() => {
    if (isDrawerOpen) {
      prevOverflowRef.current = document.body.style.overflow
      prevPaddingRightRef.current = document.body.style.paddingRight || ''
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth / 16}rem`
      }
      document.body.style.overflow = 'hidden'
      document.body.classList.add('filters-open')
    } else {
      document.body.style.overflow = prevOverflowRef.current || ''
      document.body.style.paddingRight = prevPaddingRightRef.current
      document.body.classList.remove('filters-open')
    }

    return () => {
      document.body.style.overflow = prevOverflowRef.current || ''
      document.body.style.paddingRight = prevPaddingRightRef.current
      document.body.classList.remove('filters-open')
    }
  }, [isDrawerOpen])

  useEffect(() => {
    if (!textAreaRef.current) return
    const textarea = textAreaRef.current
    const minHeight = 29
    const maxHeight = 50

    // Reset height to auto to get accurate scrollHeight
    textarea.style.height = "auto"
    const scrollHeight = textarea.scrollHeight
    const hasNewline = textarea.value.includes("\n")

    // If empty or single line (no newline), always set to minHeight to prevent shifting
    if (!textarea.value || !hasNewline) {
      textarea.style.height = `${minHeight / 16}rem`
      textarea.style.overflowY = "hidden"
    } else if (scrollHeight > maxHeight) {
      textarea.style.height = `${maxHeight / 16}rem`
      textarea.style.overflowY = "auto"
    } else {
      textarea.style.height = `${scrollHeight / 16}rem`
      textarea.style.overflowY = "hidden"
    }
  }, [search])

  const disableSendButton = search?.trim()?.length === 0 || isConvertingVoiceToText || hasStartedRecording || loadingList

  // build filters inner content so we can reuse in-place and in a portal
  const setLocalFilterQuery = (key, val) => setQueryMap(prev => ({ ...prev, [key]: val }))

  const openDrawer = () => {
    // create a shallow copy of filters for local editing
    try {
      setPendingFilters(JSON.parse(JSON.stringify(filters || {})))
    } catch (e) {
      setPendingFilters({ ...filters })
    }
    // determine which sections to open based on currently applied filters
    if (dropdown_meta && dropdown_meta.length) {
      const isNonEmpty = (v) => {
        if (v == null) return false
        if (Array.isArray(v)) return v.length > 0
        if (typeof v === 'string') return v.trim() !== ''
        if (typeof v === 'object') return Object.keys(v).length > 0
        return Boolean(v)
      }

      const selectedKeys = Object.keys(filters || {}).filter(k => isNonEmpty(filters[k]))

      const map = {}
      if (selectedKeys.length > 0) {
        // open only the filter sections that are currently selected
        dropdown_meta.forEach((d) => {
          map[d.key] = selectedKeys.includes(d.key)
        })
      } else {
        // default: open the first section
        dropdown_meta.forEach((d, i) => {
          map[d.key] = i === 0
        })
      }
      setOpenMap(map)
    }
    setIsDrawerOpen(true)
  }

  const pendingCount = Object.values(pendingFilters || {}).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0)

  useEffect(() => {
    if (!dropdown_meta || !dropdown_meta.length) return

    // Initialize openMap only once: open selected sections (themes/org) or first by default
    setOpenMap(prev => {
      if (Object.keys(prev).length > 0) return prev

      const isNonEmpty = (v) => {
        if (v == null) return false
        if (Array.isArray(v)) return v.length > 0
        if (typeof v === 'string') return v.trim() !== ''
        if (typeof v === 'object') return Object.keys(v).length > 0
        return Boolean(v)
      }

      const selectedKeys = Object.keys(filters || {}).filter(k => isNonEmpty(filters[k]))
      const map = {}
      if (selectedKeys.length > 0) {
        dropdown_meta.forEach(d => { map[d.key] = selectedKeys.includes(d.key) })
      } else {
        dropdown_meta.forEach((d, i) => { map[d.key] = i === 0 })
      }
      return map
    })
  }, [dropdown_meta])

  const filtersInner = (
    <>

      <div>
        <button
          onClick={openDrawer}
          aria-label={t('repository.filters.open')}
          className="relative flex items-center justify-center"
        >
          <Filter
            size={25}
            strokeWidth={1.8}
            className="text-[var(--listing-text-light)]"
          />

          <span className="sr-only">
            {t('repository.filters')}
          </span>

          {Object.values(filters || {}).reduce(
            (s, v) => s + (Array.isArray(v) ? v.length : 0),
            0
          ) > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[0.6rem] font-semibold text-white bg-[var(--listing-primary)] rounded-full">
                {Object.values(filters || {}).reduce(
                  (s, v) => s + (Array.isArray(v) ? v.length : 0),
                  0
                )}
              </span>

            )}
        </button>
      </div>


      <div className="flex justify-end ml-auto relative z-10 w-auto lg:w-[25%] overflow-hidden lg:mt-0 opacity-100 block">
        <div className="flex flex-col items-start w-full">
        </div>
      </div>

      {isDrawerOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[99999]" style={{ ...theme.vars }}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsDrawerOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full md:w-[35.7rem] bg-white shadow-lg p-4 filters-drawer flex flex-col" style={{ zIndex: 99999 }}>
            <div className="flex items-center justify-between pb-2">
              <h3 className="font-comfortaa text-[1rem] font-bold uppercase leading-none tracking-normal text-[var(--listing-body-text)]">
                {t('repository.filters.title')}
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-center"
                aria-label="Close filters"
              >
                <X className="w-8 h-8 text-[var(--listing-danger)]" strokeWidth={2} />
              </button>
            </div>

            <div className="w-full h-[0.1rem] bg-[var(--listing-black)] mb-8" />

            <div className="flex-1 overflow-auto space-y-6 [&::-webkit-scrollbar]:hidden">
              {/* drawer-level search removed per user request; per-section searches below */}

              {dropdown_meta?.length
                ? dropdown_meta?.map(({ label, options, key }) => {
                  const q = (queryMap[key] || "").toLowerCase()
                  const filtered = options?.filter(o => (o.display || "").toLowerCase().includes(q)) || []

                      const isOpen = !!openMap[key]

                      return (
                        <div key={key} className="border-b pb-4">
                          <div className="flex items-center justify-between mb-2">
                            {/* <label className="block font-medium text-[var(--listing-primary)]">{label}</label> */}
                            <label className="block font-bold text-[0.8rem] leading-none tracking-normal text-[var(--listing-primary)]" style={{ fontFamily: "Comfortaa" }}>{label}</label>
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              onClick={() => setOpenMap(prev => ({ ...prev, [key]: !isOpen }))}
                              className="p-0.5 rounded hover:bg-gray-100 text-xs leading-none"
                            >
                              {isOpen ? 'v' : '^'}
                            </button>
                          </div>

                          {isOpen ? (
                            <>
                              <div className="mb-2 w-full">
                                <div className="flex items-center h-[3.3rem] w-full border border-[var(--listing-border)] bg-white px-3 rounded-[0.6rem]">
                                  <Search
                                    className="w-[1.1rem] h-[1.1rem] text-[var(--listing-subdued-text)] flex-shrink-0"
                                  />

                                  <input
                                    type="text"
                                    aria-label={`Search ${label}`}
                                    placeholder={
                                      hasStartedRecording
                                        ? t("repository.recording", {
                                          seconds: seconds.toFixed(1),
                                        })
                                        : isConvertingVoiceToText
                                          ? t("repository.convertingVoice")
                                          : t("repository.searchIn", {
                                            section: label,
                                          })
                                    }
                                    className="flex-1 px-3 bg-transparent outline-none text-[0.9rem] font-normal text-[var(--listing-text-bold)] placeholder:text-[var(--listing-text-normal)]"
                                    value={queryMap[key] || ""}
                                    onChange={(e) =>
                                      setLocalFilterQuery(key, e.target.value)
                                    }
                                  />

                                  <button
                                    type="button"
                                    onClick={
                                      hasStartedRecording
                                        ? stopRecording
                                        : () => startSectionRecording(key)
                                    }
                                    className="flex items-center justify-center w-8 h-8"
                                  >
                                    {hasStartedRecording ? (
                                      <FaRegStopCircle className="w-[1.1rem] h-[1.1rem] text-red-500" />
                                    ) : (
                                      <IoMicOutline className="w-[1.1rem] h-[1.1rem] text-[var(--listing-text-normal)]" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <DropdownSelect compact label={label} options={filtered} selected={pendingFilters[key] || []} onChange={value => setPendingFilters(prev => ({ ...prev, [key]: value }))} />
                            </>
                          ) : null}
                        </div>
                      )
                })
                : null}
            </div>

            <div className="flex-none border-t bg-white py-3">
              <div className="max-w-full mx-auto px-0">
                <div className="flex items-center justify-between">
                  <button className="px-3 py-2 rounded-[12px] text-[var(--listing-muted-text)] bg-transparent" onClick={async () => {
                      try {
                        await clearTransientFiltersAtomic();
                      } catch (e) { console.error('[Filters] clearTransientFiltersAtomic error', e); }
                      setPendingFilters({}); setQueryMap({}); setIsDrawerOpen(false); scrollToBrowseResources();
                    }}>
                      {t('repository.filters.clearAll')}
                    </button>

                  <div className="flex items-center gap-2">
                    <button
                      className={`px-3 py-2 rounded-[12px] bg-[var(--listing-secondary)] text-white ${pendingCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => { if (pendingCount === 0) return; setFilters(pendingFilters || {}); setIsDrawerOpen(false); scrollToBrowseResources(); }}
                      disabled={pendingCount === 0}  
                    >
                      {t('repository.filters.apply')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>,
        document.body
      )}
    </>
  )

  return (
    <>
      <style>{`
        textarea[name="message-box"]:focus::placeholder {
          background-color: transparent !important;
        }
        textarea[name="message-box"]::placeholder {
          background-color: transparent !important;
        }
        textarea[name="message-box"] {
          scrollbar-width: thin;
          scrollbar-color: var(--listing-subdued-text) transparent;
          line-height: 1.1875rem;
          padding-top: 0.3125rem;
          padding-bottom: 0.3125rem;
        }
        textarea[name="message-box"]::-webkit-scrollbar {
          width: 0.25rem;
        }
        textarea[name="message-box"]::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea[name="message-box"]::-webkit-scrollbar-thumb {
          background-color: var(--listing-subdued-text);
          border-radius: 0.125rem;
        }
        textarea[name="message-box"]::-webkit-scrollbar-thumb:hover {
          background-color: var(--listing-muted-text);
        }
        /* Hide visible scrollbars inside the filters drawer but keep scrolling functional */
        .filters-drawer {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
        }
        .filters-drawer::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
        /* Small compact lists should scroll but not show scrollbars */
        .compact-list {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
        }
        .compact-list::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
        /* Make checkboxes and selection accents use secondary color */
        .filters-drawer input[type="checkbox"], .compact-list input[type="checkbox"] {
          accent-color: var(--listing-secondary);
        }
      `}</style>
      {!isDrawerOpen && <HiddenRecorder />}
      <Notification />

      <div
        ref={filtersRef}
        id="filters-boundary"
        className="relative z-10 isolate flex flex-col lg:flex-row items-stretch lg:items-center bg-white w-fit rounded-[1rem] shadow-[0_0_4px_rgba(0,0,0,0.2)]"
      >
        {filtersInner}
      </div>

      {/* Mobile floating Filters button removed to avoid duplicate controls on small screens */}
    </>
  )
}

const CheckboxOption = props => {
  const { isSelected } = props

  return (
    <components.Option {...props}>
      <div className="flex items-center px-2 py-1">
        <span
          style={{
            width: '1rem',
            height: '1rem',
            minWidth: '1rem',          // 👈 prevents shrink
            minHeight: '1rem',
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: '0.5rem',
            border: "0.09375rem solid",
            borderColor: isSelected
                ? "var(--listing-secondary)"
              : "var(--listing-subdued-text)",
            backgroundColor: isSelected
                ? "var(--listing-secondary)"
              : "var(--listing-white)",
            borderRadius: 3,
            flexShrink: 0,         // 👈 VERY IMPORTANT
          }}
        >
          {isSelected && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 20 20"
              fill="white"
            >
              <path d="M7.629 14.571L3.286 10.229l1.428-1.429 2.915 2.914 7.657-7.657 1.428 1.429z" />
            </svg>
          )}
        </span>

        <label style={{ cursor: "pointer" }}>
          {props.label}
        </label>
      </div>
    </components.Option>
  )
}



const MenuList = props => {
  const { t } = useTranslation();
  const { options, value, onChange } = props.selectProps

  const allSelected = value?.length === options?.length

  const toggleSelectAll = () => {
    if (allSelected) {
      onChange([], { action: "deselect-all" })
    } else {
      onChange(options, { action: "select-all" })
    }
  }

  return (
    <components.MenuList {...props}>
        <div
        className="flex items-center px-3 py-2 border-b border-[var(--listing-border)] bg-transparent cursor-pointer"
        onClick={toggleSelectAll}
      >
        <span
          style={{
            width: '1rem',
            height: '1rem',
            minWidth: '1rem',
            minHeight: '1rem',
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: '0.5rem',
            border: "0.09375rem solid",
            borderColor: allSelected
                ? "var(--listing-secondary)"
              : "var(--listing-subdued-text)",
            backgroundColor: allSelected
                ? "var(--listing-secondary)"
              : "var(--listing-white)",
            borderRadius: 3,
            flexShrink: 0,
          }}
      >
        {allSelected && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 20 20"
              fill="white"
            >
              <path d="M7.629 14.571L3.286 10.229l1.428-1.429 2.915 2.914 7.657-7.657 1.428 1.429z" />
            </svg>
          )}
        </span>

        <label className="font-medium text-[var(--listing-strong-text)] cursor-pointer select-none">
          {allSelected ? t('repository.filters.deselectAll') : t('repository.filters.selectAll')}
        </label>
      </div>

      {props.children}
    </components.MenuList>
  )
}

const DropdownSelect = ({ label, options = [], selected = [], onChange, compact = false }) => {
  const { t } = useTranslation();
  const selectedCount = Array.isArray(selected) ? selected.length : 0

  // Normalize options to { value, label }
  const optionsList = (options || []).map(o => ({ value: o.value, label: o.display || o.label || o.value }))

  if (compact) {
    const selectedValues = new Set((selected || []).map(s => (typeof s === 'string' ? s : s.value)))
    const allSelected = optionsList.length > 0 && optionsList.every(o => selectedValues.has(o.value))

    const toggleSelectAll = () => {
      if (allSelected) onChange([])
      else onChange(optionsList)
    }

    const toggleOption = opt => {
      const isSelected = selectedValues.has(opt.value)
      let next
      if (isSelected) {
        next = (selected || []).filter(s => (typeof s === 'string' ? s : s.value) !== opt.value)
      } else {
        next = [...(selected || []), { value: opt.value, label: opt.label }]
      }
      onChange(next)
    }

    return (
      <div className="relative mr-4 w-full flex-shrink-0" >
        <div className="rounded bg-transparent p-2">
          <div className=" max-h-[8.8rem]
    overflow-y-auto
    [scrollbar-width:none]
    [&::-webkit-scrollbar]:w-0
    hover:[scrollbar-width:thin]
    hover:[&::-webkit-scrollbar]:w-[0.4rem]
    hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
    hover:[&::-webkit-scrollbar-thumb]:rounded-full">
            <label
              key="__select_all__"
              className="flex items-center gap-2 py-1 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
              />
              <span className="text-sm text-[var(--listing-strong-text)]">
                {t('repository.filters.selectAll')}
              </span>
            </label>

            {optionsList.map(opt => {
              const isChecked = selectedValues.has(opt.value)

              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 py-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleOption(opt)}
                  />
                  <span className="text-sm text-[var(--listing-strong-text)]">
                    {opt.label}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative mr-4 flex-shrink-0">
      <Select
        options={optionsList.map(x => ({ value: x.value, label: x.label }))}
        value={selected}
        onChange={onChange}
        isMulti
        placeholder={label}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        controlShouldRenderValue={false}
        components={{
          Option: CheckboxOption,
          MenuList: MenuList,
        }}
        styles={{
          control: base => ({
            ...base,
            border: "none",
            background: "var(--listing-surface-soft)",
            boxShadow: "none",
            minHeight: "2.25rem",
            "&:hover": { border: "none" },
          }),

          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? "var(--listing-secondary)"
              : "var(--listing-white)",
            color: state.isSelected
              ? "white"
              : "var(--listing-strong-text)",
            cursor: "pointer",
          }),

          placeholder: base => ({
            ...base,
            color: "var(--listing-muted-text)",
            gridArea: "1/1/2/3",
          }),

          menu: base => ({
            ...base,
            zIndex: 9999,
          }),

          menuPortal: base => ({
            ...base,
            zIndex: 9999,
          }),
        }}
      />
    </div>
  )
}
