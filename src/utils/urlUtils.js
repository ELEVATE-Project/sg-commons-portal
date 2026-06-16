export const openSafeUrl = (url) => {
  try {
    const parsedUrl = new URL(url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid protocol");
    }

    window.open(parsedUrl.href, "_blank", "noopener,noreferrer");

    return true;
  } catch (error) {
    console.error("Invalid URL:", error);
    return false;
  }
};