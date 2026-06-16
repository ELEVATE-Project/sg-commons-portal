import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Grid, List, ChevronDown, Check, ArrowRight } from "lucide-react";
import ResourceCard from "./ResourceCard";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore";
import MitraAiAssistantAside from "./MitraAiAssistantAside.jsx";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../../url";
// Custom hook for dropdown functionality
const useDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDropdown]);

  return {
    isOpen,
    toggleDropdown,
    closeDropdown,
    dropdownRef,
  };
};

// Reusable Dropdown Component
const Dropdown = ({
  options,
  selectedValue,
  onSelect,
  renderButton,
  renderItem = DefaultDropdownItem,
  className = "",
  dropdownClassName = "",
  disabled = false,
  tooltipText = "",
}) => {
  const { isOpen, toggleDropdown, closeDropdown, dropdownRef } = useDropdown();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSelect = useCallback(
    (value) => {
      onSelect(value);
      closeDropdown();
    },
    [onSelect, closeDropdown]
  );

  const selectedOption = useMemo(
    () =>
      options.find((opt) => String(opt.value) === String(selectedValue)) ||
      options[0],
    [options, selectedValue]
  );

  const handleButtonClick = () => {
    if (!disabled) {
      toggleDropdown();
    }
  };

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
      onMouseEnter={() => disabled && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div>
        <button
          type="button"
          className={`min-w-[100px] inline-flex items-center gap-1 text-sm focus:outline-none ${
            disabled
              ? "text-[var(--listing-disabled-text)] cursor-not-allowed"
              : "text-[var(--listing-strong-text)] hover:text-[var(--listing-muted-text)]"
          }`}
          onClick={handleButtonClick}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          disabled={disabled}
        >
          {renderButton(selectedOption, options)}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>
      </div>
      {showTooltip && tooltipText && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-[var(--listing-strong-text)] text-white text-xs rounded whitespace-nowrap z-50">
          {tooltipText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
      {isOpen && !disabled && (
        <div
          className={`absolute right-0 z-[9999] mt-2 md:w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${dropdownClassName}`}
          role="listbox"
        >
          <div className="py-1">
            {options.map((option) => {
  if (!option || option.value == null) return null;

  const RenderItem = renderItem;

  return (
    <div key={option.value} className="w-full">
      <RenderItem
        option={option}
        isSelected={String(selectedValue) === String(option.value)}
        onSelect={() => handleSelect(option.value)}
      />
    </div>
  );
})}
          </div>
        </div>
      )}
    </div>
  );
};

// Default dropdown item renderer
const DefaultDropdownItem = ({ option, isSelected, onSelect }) => {
  const { t } = useTranslation();

  if (!option) return null;

  return (
    <button
      type="button"
      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
        isSelected
          ? "bg-[var(--listing-surface)] text-[var(--listing-secondary)]"
          : "text-[var(--listing-strong-text)] hover:bg-[var(--listing-surface-soft)]"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      role="option"
      aria-selected={isSelected}
    >
      <span>{option?.label || t("repository.unknownOption")}</span>
      {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
};

export default function BrowseResources({ resources, viewMode, setViewMode, title, compact = false }) {
  const pagination = useRepositoryStore((state) => state.pagination);
  const setPagination = useRepositoryStore((state) => state.setPagination);
  const mediaCount = useRepositoryStore((state) => state.mediaCount);
  const sortBy = useRepositoryStore((state) => state.sortBy);
  const setSortBy = useRepositoryStore((state) => state.setSortBy);
  const searchInput = useRepositoryStore((state) => state.searchInput);
  const isSearchActive = searchInput && searchInput.trim().length > 0;
  const navigate = useNavigate();
  const {t} = useTranslation();
  
  const sortOptions = [
    { value: "title", label: t("repository.sort.titleAsc") },
    { value: "-title", label: t("repository.sort.titleDesc") },
    { value: "created_at", label: t("repository.sort.dateAddedOldest") },
    { value: "-created_at", label: t("repository.sort.dateAddedNewest") },
    { value: "updated_at", label: t("repository.sort.dateModifiedOldest") },
    { value: "-updated_at", label: t("repository.sort.dateModifiedNewest") },
  ];

  const itemsPerPage = pagination.limit;
const displayedResources = compact
  ? resources.slice(0, 3)
  : resources;
  const perPageOptions = [
    { value: 6, label: "6" },
    { value: 12, label: "12" },
    { value: 24, label: "24" },
    { value: 48, label: "48" },
  ];

  const handleItemsPerPageChange = (value) => {
    setPagination({ limit: Number(value) });
  };
   
  return (
    <div
  className={`relative overflow-hidden py-12 w-full scroll-mt-24 ${
    compact ? "" : "min-h-screen"
  }`}
  data-browse-resources
>
      <div
        className="absolute inset-0 z-0 pointer-events-none"
      />
      <section
  className={`relative z-10 max-w-[1500px] mx-auto ${
    compact ? "" : "min-h-screen"
  }`}
>
<div className="w-full lg:w-[92.5%] mx-auto">
        {/* ⬇️ EVERYTHING BELOW IS EXACT SAME (no change) */}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
  <div className="w-full mb-3 md:mb-0" data-browse-resources>
      <h2 className="text-[20px] md:text-[22px] font-['Comfortaa'] font-semibold tracking-[1px] text-repository-heading capitalize">

      {t(title ?? "repository.browseResources")}
    </h2>

    {!compact && (
      <p
  className="
    font-['Source_Sans_3']
    font-medium
    text-[14px]
    leading-[21px]
    text-repository-body
  "
>
  {t("repository.browseResourcesDescription")}
</p>
    )}
  </div>

  {compact ? (
    <div className="flex items-center justify-between w-full md:w-auto gap-4">
      <Dropdown
  options={sortOptions}
  selectedValue={sortBy}
  onSelect={(value) => {
    setSortBy(value);
  }}
  renderButton={(selected) => (
  <span className="whitespace-nowrap font-['Inter'] text-[12px] leading-[18px] flex items-center">
    <span className="font-normal text-repository-textPrimary">
      {t("repository.sortByLabel")}:  
    </span>{" "}
    <span className="ml-2 font-bold text-repository-textPrimary">
      {selected?.label || t("common.select")}
    </span>
  </span>
)}
/>

      <button
  type="button"
  onClick={() => navigate(ROUTES.SHIKSHAGRAHA_REPOSITORY_LIST)}
  className="
    flex items-center justify-center gap-1
    w-[120px]
    h-[36px]
    px-1 py-2
    rounded-[8px]
    bg-repository-primary
    hover:opacity-90
    transition-all
    flex-shrink-0
  "
>
  <span
    className="
      font-medium
      text-[13px]
      leading-[20px]
      text-white
    "
  >
    {t("repository.browseAll")}
  </span>

  <ArrowRight className="w-4 h-4 text-white" />
</button>
    </div>
  ) : (
    <div className="flex flex-col md:flex-row items-center gap-6 w-full">
      <div className="flex items-center justify-between lg:justify-end w-full lg:gap-6">
        <div className="whitespace-nowrap font-['Inter'] text-[12px] leading-[18px]">
  <span className="font-bold text-repository-textPrimary">
    {mediaCount}
  </span>{" "}
  <span className="font-normal text-repository-textSecondary">
    {t("repository.resultsCount_other")}
  </span>
</div>

        <Dropdown
          options={sortOptions}
          selectedValue={sortBy}
          onSelect={(value) => {
            setSortBy(value);
          }}
 renderButton={(selected) => (
  <span className="whitespace-nowrap font-['Inter'] text-[12px] leading-[18px]">
    <span className="font-normal text-repository-textSecondary">
      {t("repository.sortByLabel")}:
    </span>{" "}
    <span className="font-bold text-repository-textPrimary">
      {selected?.label || t("common.select")}
    </span>
  </span>
)}
          disabled={isSearchActive}
          tooltipText={`${t("sortDisabledTooltipText")}`}
        />
      </div>

      <div className="flex items-center justify-between flex-row-reverse lg:flex-row lg:justify-start lg:gap-6 w-full lg:w-auto">
        <div className="flex items-center gap-1">
          <button
  onClick={() => setViewMode("grid")}
  className={`
    flex items-center justify-center
    w-[28.09px]
    h-[29.85px]
    rounded-[7.023px]
    border
    transition-all
    ${
      viewMode === "grid"
        ? "bg-repository-primary border-repository-primary text-white"
        : "bg-white border-repository-controlBorder text-repository-controlIcon"
    }
  `}
>
  <Grid
  className={`w-[14.05px] h-[14.05px]`}
/>
</button>

          <button
  onClick={() => setViewMode("list")}
  className={`
    flex items-center justify-center
    w-[28.09px]
    h-[29.85px]
    rounded-[7.023px]
    border
    transition-all
    ${
      viewMode === "list"
        ? "bg-repository-primary border-repository-primary text-white"
        : "bg-white border-repository-controlBorder text-repository-controlIcon"
    }
  `}
>
  <List
  className={`w-[14.05px] h-[14.05px]`}
/>
</button>
        </div>

       <Dropdown
  options={perPageOptions}
  selectedValue={itemsPerPage}
  onSelect={(value) => {
    handleItemsPerPageChange(value);
  }}
  className="
    [&>div>button]:w-[88px]
    [&>div>button]:h-[29.85px]
    [&>div>button]:border
    [&>div>button]:border-repository-controlBorder
    [&>div>button]:rounded-[8.779px]
    [&>div>button]:bg-white
    [&>div>button]:px-3
    [&>div>button]:justify-between
  "
  dropdownClassName="w-[88px]"
  renderButton={(selected) => (
    <span
  className="
    font-['Inter']
    font-normal
    text-[12.2911px]
    leading-[18px]
    text-repository-textPrimary
    flex
    items-center
  "
>
  {selected?.label || "6"} {t("repository.items")}
</span>
  )}
/>
      </div>
    </div>
  )}
</div>

        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 z-0 pointer-events-none"
          />
          <div className="relative z-10">
            <div className="flex gap-0 md:!gap-6 items-stretch justify-start md:justify-center">
              <div
  className={`grid gap-6 w-full ${
    viewMode === "grid"
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1"
  }`}
>
               {displayedResources.map((resource, index) => (
                  <React.Fragment key={`resource-${resource.id}-${index}`}>
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      index={index}
                       viewMode={viewMode}
                    />
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden lg:block w-[20%] self-stretch p-4 rounded-xl z-[9999]">
            <MitraAiAssistantAside />
          </div>
        </div>
</div>
      </section>
    </div>
  );
}
