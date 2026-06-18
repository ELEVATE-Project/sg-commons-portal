export const openSafeUrl = (url) => {
  try {
    const parsedUrl = new URL(url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid protocol");
    }

    const newWindow = window.open(parsedUrl.href, "_blank", "noopener,noreferrer");

    // window.open returns null if blocked
    if (!newWindow) {
      console.warn("Popup blocked or failed to open URL:", parsedUrl.href);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Invalid URL:", error);
    return false;
  }
};