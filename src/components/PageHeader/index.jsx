import React from "react";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PageHeader = ({
  title = "",
  showHome = true,
  onHomeClick,
}) => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="w-full border-b border-repository-headerBorder px-6 py-5">
      <div className="flex items-center gap-4">
        {showHome && (
  <>
    <button
      onClick={handleHomeClick}
      aria-label="Go to home page"
      title="Home"
      className="text-repository-primary hover:opacity-80 transition"
    >
      <Home size={20} aria-hidden="true" />
    </button>

    <div className="h-5 w-0.5 bg-repository-dark" />
  </>
)}

        <h1 className="text-[20px] font-semibold text-repository-pageTitle">
          {title}
        </h1>
      </div>
    </div>
  );
};

export default PageHeader;