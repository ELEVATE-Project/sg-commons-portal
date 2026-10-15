import React from "react";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RepositorySearch from "../RepositorySearch/RepositorySearch";

const PageHeader = ({
  title = "",
  showHome = true,
  onHomeClick,
  showSearch = false,
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
    <div className="w-full border-b border-repository-headerBorder px-4 sm:px-6 py-5 rounded-[20px]">
      <div
  className={
    showSearch
      ? "grid grid-cols-[auto_1fr] items-center gap-3 md:grid-cols-[1fr_minmax(24rem,2fr)_1fr] md:gap-4"
      : "flex items-center gap-4"
  }
>
  <div className="flex items-center gap-3 min-w-0">
    {showHome && (
      <>
        <button
          onClick={handleHomeClick}
          aria-label="Go to home page"
          title="Home"
          className="text-repository-primary hover:opacity-80 transition flex-shrink-0"
        >
          <Home size={20} aria-hidden="true" />
        </button>

        <div className="h-5 w-0.5 bg-repository-dark flex-shrink-0" />
      </>
    )}

    {title ? (
      <h1 className="text-[1.25rem] font-semibold text-repository-pageTitle truncate">
        {title}
      </h1>
    ) : null}
  </div>

  {showSearch && (
    <>
      <div className="min-w-0">
        <RepositorySearch variant="header" />
      </div>
      <div className="hidden md:block" aria-hidden="true" />
    </>
  )}
</div>
    </div>
  );
};

export default PageHeader;
