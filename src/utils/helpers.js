// utils/helpers.js
import { bot_websocket } from "configure"
import { languageList } from "../constants/enum"
import { sessionFlowName } from "../constants/session"
import { STORAGE_KEYS } from "./constants"
import env from "./env"
import { useAICreationSessionStore } from "../store"

/**
 * Get default language based on use case type
 * @param {string} usecaseType - The use case type
 * @returns {string} Default language value
 */
export const getDefaultLanguage = usecaseType => {
  switch (usecaseType) {
    default:
      return languageList[0].value
  }
}

/**
 * Filter languages by use case type
 * @param {string} usecaseType - The use case type
 * @returns {Array} Filtered language list
 */
export const getFilteredLanguages = usecaseType => {
  return languageList.filter(lang => !lang.excludeFor.some(x => x === usecaseType))
}

/**
 * Initialize language in localStorage if not exists
 * @param {string} usecaseType - The use case type
 */
export const initializeLanguageStorage = usecaseType => {
  if (!localStorage.getItem(STORAGE_KEYS.LOCAL_ROUTE)) {
    localStorage.setItem(STORAGE_KEYS.LOCAL_ROUTE, JSON.stringify(getDefaultLanguage(usecaseType)))
  }
}

/**
 * Get logo width class based on language
 * @param {string} language - Current language
 * @returns {string} CSS class for logo width
 */
export const getLogoWidthClass = language => {
  return language === "en" ? "w-[8.75rem]" : "w-[6.25rem]"
}

/**
 * Check if language button should be visible
 * @param {*} languageButtonSelect - Language button select state
 * @returns {boolean} Whether language button should be visible
 */
export const shouldShowLanguageButton = languageButtonSelect => {
  return languageButtonSelect && ![null, ""].includes(languageButtonSelect)
}

export function buildWebSocketUrl({ searchParams, storageFlow }) {
  if (searchParams.get("code")) {
    // NOTE: revert this code after testing
    // return `${wssProtocol}${window.location.host}/ws/chat/company/`;
    return `${env.WS_PROTOCOL()}://${env.WEBSOCKET_HOST()}/ws/chat/company/`
  }

  const baseUrl = `${env.WS_PROTOCOL()}://${env.WEBSOCKET_HOST()}`
  const currentFlow = storageFlow

  // Direct flow to websocket mapping
  const websocketConfig = {
    [sessionFlowName.Creation]: bot_websocket.creation,
    [sessionFlowName.FreeFlow]: bot_websocket.free_flow,
    [sessionFlowName.LFA]: bot_websocket.lfa,
    [sessionFlowName.LCF]: bot_websocket.lcf,
  }


  // Check direct flow mapping first
  if (websocketConfig[currentFlow]) {
    return `${baseUrl}${websocketConfig[currentFlow]}`
  }

  return null
}

export const isSilentAudio = async (blob, silenceThreshold = 0.01) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const arrayBuffer = await blob.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  const rawData = audioBuffer.getChannelData(0)

  const rms = Math.sqrt(rawData.reduce((acc, val) => acc + val * val, 0) / rawData.length)
  console.log("RMS (volume):", rms)

  return rms < silenceThreshold
}

export const formatTime = secs => {
  const minutes = Math.floor(secs / 60)
  const seconds = secs % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function clearMitraSessionStorage() {
  // Clear the Zustand store and its persisted storage
  useAICreationSessionStore.persist.clearStorage();
  useAICreationSessionStore.getState().reset();
  
  // Then remove from sessionStorage
  sessionStorage.removeItem("aiCreationData");
}