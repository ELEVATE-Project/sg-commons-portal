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
    <div className="w-full border-b border-repository-headerBorder px-6 py-5">
      <div
        className={
          showSearch
            ? "grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center"
            : "flex items-center gap-4"
        }
      >
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

          {title ? (
            <h1 className="text-[1.25rem] font-semibold text-repository-pageTitle">
              {title}
            </h1>
          ) : null}
        </div>

        {showSearch && (
          <>
            <RepositorySearch variant="header" />
            <div aria-hidden="true" />
          </>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
