export const openSafeUrl = (url) => {
  try {
    const parsedUrl = new URL(url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid protocol");
    }

    const link = document.createElement("a");
    link.href = parsedUrl.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Invalid URL:", error);
    return false;
  }
};