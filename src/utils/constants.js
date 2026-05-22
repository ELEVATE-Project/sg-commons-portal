// utils/constants.js
import env from "./env"

export const rootPath = env.ROOT_PATH() ? `/${env.ROOT_PATH().replace(/^\/|\/$/g, "")}` : ""

// Storage keys
export const STORAGE_KEYS = {
  LOCAL_ROUTE: "local_route",
}
