// utils/helpers.js
import { bot_websocket } from "configure"
import { languageList } from "../constants/enum"
import { sessionFlowName } from "../constants/session"
import { STORAGE_KEYS } from "./constants"
import env from "./env"
import { bot_routes } from "../configure"
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
  return language === "en" ? "w-[140px]" : "w-[100px]"
}

/**
 * Check if language button should be visible
 * @param {*} languageButtonSelect - Language button select state
 * @returns {boolean} Whether language button should be visible
 */
export const shouldShowLanguageButton = languageButtonSelect => {
  return languageButtonSelect && ![null, ""].includes(languageButtonSelect)
}

export function buildWebSocketUrl({ searchParams, storageFlow, selectedType, wssProtocol = 'wss://' }) {
  if (searchParams.get("code")) {
    // NOTE: revert this code after testing
    // return `${wssProtocol}${window.location.host}/ws/chat/company/`;
    return `${env.WS_PROTOCOL()}://${env.WEBSOCKET_HOST()}/ws/chat/company/`
  }

  const baseUrl = `${env.WS_PROTOCOL()}://${env.WEBSOCKET_HOST()}`
  const currentFlow = storageFlow

  // Direct flow to websocket mapping
  const websocketConfig = {
    [sessionFlowName.GuestDiscussion]: bot_websocket.shikshalokam_chaupal,
    [sessionFlowName.LoginDiscussion]: bot_websocket.shikshalokam_chaupal,
    [sessionFlowName.ListeningActivity]: bot_websocket.listening_activity,
    [sessionFlowName.ParentPerceptionSurvey]: bot_websocket.parent_perception_survey,
    [sessionFlowName.Creation]: bot_websocket.creation,
    [sessionFlowName.FreeFlow]: bot_websocket.free_flow,
    [sessionFlowName.LFA]: bot_websocket.lfa,
    [sessionFlowName.LCF]: bot_websocket.lcf,
  }

  const normalTypeConfig = {
    normal: {
      [sessionFlowName.LoginMiStory]: bot_websocket.normal,
      [sessionFlowName.GuestMiStory]: bot_websocket.guest_normal,
    },
    oneshot: {
      [sessionFlowName.LoginMiStory]: bot_websocket.oneshot,
      [sessionFlowName.GuestMiStory]: bot_websocket.guest_oneshot,
    },
  }


  // Check direct flow mapping first
  if (websocketConfig[currentFlow]) {
    return `${baseUrl}${websocketConfig[currentFlow]}`
  }

  // Check type-based mapping
  const selectedTypeConfig = normalTypeConfig[selectedType]
  if (selectedTypeConfig && selectedTypeConfig[currentFlow]) {
    return `${baseUrl}${selectedTypeConfig[currentFlow]}`
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

export function getSessionRoute(storageFlow, selectedType) {
  const currentFlow = storageFlow
  console.log("Current Flow:", currentFlow)
  console.log("Is the flow equal", currentFlow === sessionFlowName.ListeningActivity)

  // Configuration mapping flow names to bot routes
  const flowToRouteMap = {
    [sessionFlowName.GuestDiscussion]: bot_routes.shikshalokam_chaupal,
    [sessionFlowName.LoginDiscussion]: bot_routes.shikshalokam_chaupal,
    [sessionFlowName.ListeningActivity]: bot_routes.listening_activity,
  }

  const typeBasedRouteMap = {
    normal: {
      [sessionFlowName.LoginMiStory]: bot_routes.normal,
      [sessionFlowName.GuestMiStory]: bot_routes.guest_normal,
    },
    oneshot: {
      [sessionFlowName.LoginMiStory]: bot_routes.oneshot,
      [sessionFlowName.GuestMiStory]: bot_routes.guest_oneshot,
    },
  }

  // Check direct flow mapping first
  if (currentFlow && flowToRouteMap[currentFlow]) {
    return flowToRouteMap[currentFlow]
  }

  // Check type-based mapping
  const routeMap = selectedType === "normal" ? typeBasedRouteMap.normal : typeBasedRouteMap.oneshot

  if (currentFlow && routeMap[currentFlow]) {
    return routeMap[currentFlow]
  }

  // Default route
  return bot_routes.reflection
}

export const formatTime = secs => {
  const minutes = Math.floor(secs / 60)
  const seconds = secs % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function clearMitraSessionStorage(avoidLogout = false) {
  // Clear the Zustand store and its persisted storage
  useAICreationSessionStore.persist.clearStorage();
  useAICreationSessionStore.getState().reset();
  
  // Then remove from sessionStorage
  sessionStorage.removeItem("aiCreationData");
}