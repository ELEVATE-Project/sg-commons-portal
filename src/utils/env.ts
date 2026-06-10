/**
 * Environment configuration utility
 * Supports both build-time (process.env) and runtime (window._env_) variables
 *
 * Priority: window._env_ > process.env
 */

const getEnv = (key: string, defaultValue: string = "") => {
  const legacyKey = key.replace(/^VITE_/, "REACT_APP_")

  if ((window as any)._env_ && (window as any)._env_[key] !== undefined) {
    return (window as any)._env_[key]
  }
  if ((window as any)._env_ && (window as any)._env_[legacyKey] !== undefined) {
    return (window as any)._env_[legacyKey]
  }
  if ((import.meta as any).env[key] !== undefined) {
    return (import.meta as any).env[key]
  }
  if ((import.meta as any).env[legacyKey] !== undefined) {
    return (import.meta as any).env[legacyKey]
  }
  return defaultValue
}

const normalizePathSegment = (value: string = "") => value.replace(/^\/+|\/+$/g, "")
const isLocalDevHost = () => {
  if (typeof window === "undefined") return false
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)
}

// Export all environment variables with their getters
export const env = {
  // API Configuration
  LOCAL_PROXY: () => getEnv("VITE_LOCAL_PROXY", "https://commons.shikshagraha.org"),
  WEBSOCKET_HOST: () => getEnv("VITE_WEBSOCKET_HOST", "localhost:8000"),

  // Retry Configuration
  WEBSOCKET_RETRY_NUM: () => parseInt(getEnv("VITE_WEBSOCKET_RETRY_NUM", "2"), 10),
  S3_UPLOAD_RETRY_NUM: () => parseInt(getEnv("VITE_S3_UPLOAD_RETRY_NUM", "3"), 10),

  // Paths
  AUDIO_PATH: () => getEnv("VITE_AUDIO_PATH", getEnv("REACT_APP_AUDIO_PATH", "/mohini/")),
  ROOT_PATH: () => {
    if (isLocalDevHost()) return ""
    return normalizePathSegment(getEnv("VITE_ROOT_PATH", ""))
  },

  // URLs
  RECORD_STORY_URL: () => getEnv("VITE_RECORD_STORY_URL", ""),

  WS_PROTOCOL: () => getEnv("VITE_WS_PROTOCOL", "wss"),

  // Generic getter for any environment variable
  get: (key: string, defaultValue: string = "") => getEnv(key, defaultValue),
}

export default env