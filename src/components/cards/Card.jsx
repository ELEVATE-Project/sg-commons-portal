import React from "react";
import { showNotification } from "../ToastMessage/TotastMessage";

const Card = ({ className = "", label, title, description, sourceUrl, show = "", showSourcePopup }) => {
  const handleCopySourceUrl = async (url) => {
    if (!url) {
      showNotification({
        message: "No source URL available to copy.",
        type: "error",
        options: {
          position: "top-center",
          autoClose: 3000,
          style: { fontWeight: "bold", width: "80%" },
        },
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      showNotification({
        message: "Source URL copied to clipboard!",
        type: "success",
        options: {
          position: "top-center",
          autoClose: 3000,
          style: { fontWeight: "bold", width: "80%" },
        },
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      showNotification({
        message: "Failed to copy source URL. Please try again.",
        type: "error",
        options: {
          position: "top-center",
          autoClose: 3000,
          style: { fontWeight: "bold", width: "80%" },
        },
      });
    }
  };


  return (
    <div
      className={`flex flex-col border-[0.0313rem] border-solid border-repository.cardAccent gap-3 pt-2 pr-[0.625rem] pb-2 pl-[0.625rem] rounded-[0.625rem] bg-white w-full my-[0.625rem] mx-0 md:my-0 md:mx-0 shadow-[0rem_0.25rem_0.25rem_0rem_#0000001A] md:shadow-none ${className}`}
    >
      <div className="font-bold text-[0.75rem] leading-none">{label}</div>
      <div className="font-medium text-[0.875rem] leading-none text-black break-words whitespace-normal max-w-full">
        {title}
      </div>
      <div className="font-normal text-[0.75rem] leading-none text-repository-textPrimary">
        {description}
      </div>
      <div className="flex justify-end gap-2">
        {show && <button onClick={showSourcePopup} className="font-semibold text-[0.75rem] leading-none text-repository-link">
          Show
        </button>}
        {sourceUrl && <button onClick={() => handleCopySourceUrl(sourceUrl)} className="font-semibold text-[0.75rem] leading-none text-repository-link">
            Source URL  
          </button>}
      </div>
    </div>
  );
};

export default Card;

