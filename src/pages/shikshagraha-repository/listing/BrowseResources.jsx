import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Grid, List, ChevronDown, Check, ArrowRight, X } from "lucide-react";
import ResourceCard from "./ResourceCard";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore";
import MitraAiAssistantAside from "./MitraAiAssistantAside.jsx";
import Filters from "./Filters";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const selectedOption = useMemo(() => {
    if (!options || selectedValue == null) return null;
    return options.find((o) => String(o.value) === String(selectedValue)) ?? null;
  }, [options, selectedValue]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            if (!disabled) toggleDropdown();
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded ${dropdownClassName}`}
        >
          {renderButton ? renderButton(selectedOption) : <span>{selectedOption?.label ?? ""}</span>}
          <span className={`w-4 h-4 transition-transform ${isOpen ? "transform rotate-180" : ""}`}>
            <ChevronDown size={16} />
          </span>
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
          className={`absolute right-0 left-auto sm:left-auto
max-w-[90vw] z-[9999] mt-2 md:w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${dropdownClassName}`}
          role="listbox"
        >
          <div className="py-1">
            {options.map((option) => {
              if (!option || option.value == null) return null;

              const RenderItem = renderItem;

              return (
                <div key={option.value} className="flex-1">
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

export default function BrowseResources({ resources, viewMode, setViewMode, title, compact = false, cardsSpacing = false }) {
  const pagination = useRepositoryStore((state) => state.pagination);
  const setPagination = useRepositoryStore((state) => state.setPagination);
  const mediaCount = useRepositoryStore((state) => state.mediaCount);
  const sortBy = useRepositoryStore((state) => state.sortBy);
  const setSortBy = useRepositoryStore((state) => state.setSortBy);
  const searchInput = useRepositoryStore((state) => state.searchInput);
  const fetchMasterList = useRepositoryStore((state) => state.fetchMasterList);
  const masterList = useRepositoryStore((state) => state.masterList);
  const fetchMediaList = useRepositoryStore((state) => state.fetchMediaList);
  const fetchMediaDetail = useRepositoryStore((state) => state.fetchMediaDetail);
  const selectedMedia = useRepositoryStore((state) => state.selectedMedia);
  const setFilters = useRepositoryStore((state) => state.setFilters);
  const resetFilters = useRepositoryStore((state) => state.resetFilters);
  const setApplyingUrlFilters = useRepositoryStore((state) => state.setApplyingUrlFilters);
  const applyingUrlFilters = useRepositoryStore((state) => state.applyingUrlFilters);
  const loadingList = useRepositoryStore((state) => state.loadingList);
  const isSearchActive = searchInput && searchInput.trim().length > 0;
  const navigate = useNavigate();
  const {t} = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const orgParam = searchParams.get("org");
  const themeParam = searchParams.get("theme");
  const fromResourceParam = searchParams.get("fromResource");
  const searchStr = searchParams.toString();
  const suppressTryClearRef = useRef(false);
  const suppressFromResourceOrgRestoreRef = useRef(false);
  // Atomic routine to clear transient URL params and reset store filters
  const clearTransientFiltersAtomic = useCallback(async (opts = {}) => {
    const { navigateToResourceId } = opts;
    try {
      // mark we're applying URL-driven changes to silence effects
      try { useRepositoryStore.getState().setApplyingUrlFilters(true); } catch (e) {}
      suppressTryClearRef.current = true;

      // remove transient params from URL
      const next = new URLSearchParams(window.location.search || "");
      ["org", "theme", "resource_type", "resource_types", "media_type", "media_types", "file_type", "filetype", "tags", "fromResource"].forEach((k) => next.delete(k));
      safeSetSearchParams(next, { replace: true });
      // replace history entry so Back won't restore filtered entry
      try { window.history.replaceState({}, '', window.location.pathname + (next.toString() ? `?${next.toString()}` : '')); } catch (e) {}

      // force-reset store (bypass applyingUrlFilters guard) and then either navigate or fetch
      const forceReset = useRepositoryStore.getState().forceResetFilters;
      const fetch = useRepositoryStore.getState().fetchMediaList;
      if (forceReset) forceReset({ skipFetch: true }); else useRepositoryStore.getState().resetFilters({ skipFetch: true });

      if (navigateToResourceId) {
        navigate(`/resources/${navigateToResourceId}`, { replace: true });
        // ensure flags are cleared
        suppressTryClearRef.current = false;
        try { useRepositoryStore.getState().setApplyingUrlFilters(false); } catch (e) {}
        return;
      }

      if (fetch) {
        await fetch({}, true);
      }
    } catch (err) {
      // ignore
    } finally {
      suppressTryClearRef.current = false;
      try { setFiltersInitialized(true); } catch (e) {}
      try { useRepositoryStore.getState().setApplyingUrlFilters(false); } catch (e) {}
    }
  }, [navigate]);
  const safeSetSearchParams = (next, opts = { replace: true }) => {
    try {
      setSearchParams(next, opts);
    } catch (e) {
      // ignore
    }
  };
  const filters = useRepositoryStore((state) => state.filters);
  const [filtersInitialized, setFiltersInitialized] = useState(!(orgParam || themeParam));

  // NOTE: defensive reset removed — resetting filters here caused races
  // with URL-driven filter application and produced flicker. Rely on
  // Home-level reset and explicit clears on navigation instead.

  const selectedSingleLabel = useMemo(() => {
    const orgs = filters?.organizations || [];
    const tags = filters?.tags || [];

    // If exactly one organisation selected, prefer its full display name from masterList
    if (Array.isArray(orgs) && orgs.length === 1 && (!tags || tags.length <= 1)) {
      const selected = orgs[0] || {};
      let name = selected.display || selected.value || "";
      try {
        const orgDropdown = masterList?.find(d => d.key === 'organizations');
        const match = orgDropdown?.options?.find(o => String(o.value) === String(selected.value));
        if (match && match.display) name = match.display;
      } catch (e) {
        // ignore
      }
      return { type: "Organisation", name };
    }

    // If exactly one theme (tag) selected, prefer its full display name from masterList
    if (Array.isArray(tags) && tags.length === 1 && (!orgs || orgs.length !== 1)) {
      const selected = tags[0] || {};
      let name = selected.display || selected.value || "";
      try {
        const tagDropdown = masterList?.find(d => d.key === 'tags');
        const match = tagDropdown?.options?.find(o => String(o.value) === String(selected.value));
        if (match && match.display) name = match.display;
      } catch (e) {
        // ignore
      }
      return { type: "Theme", name };
    }

    return null;
  }, [filters, masterList]);

  // Labels for group chips
  const filterGroupLabels = {
    organizations: "Organization",
    tags: "Theme",
    resource_types: "Resource Type",
    resource_type: "Resource Type",
    file_types: "File Type",
    filetype: "File Type",
    media_types: "Media Type",
  };

  // Build group-level chips (label + condensed value string)
  const filterGroupChips = useMemo(() => {
    if (!filters) return [];
    return Object.entries(filters).flatMap(([group, values]) => {
      if (!Array.isArray(values) || values.length === 0) return [];
      const label = filterGroupLabels[group] || group.replace(/_/g, " ");
      const names = values
        .map((item) => {
          if (!item) return "";
          if (typeof item === "string") return item;
          return item.display || item.label || item.value || "";
        })
        .filter(Boolean);
      const hasOverflow = names.length > 2;
      const display = hasOverflow ? names.slice(0, 2).join(", ") : names.join(", ");
      const overflowLabel = hasOverflow ? `+${names.length - 2}` : "";
      const mobileDisplay = names[0] || "";
      const mobileOverflowLabel = names.length > 1 ? `+${names.length - 1}` : "";
      return [{ group, label, display, overflowLabel, mobileDisplay, mobileOverflowLabel, count: names.length }];
    });
  }, [filters]);

  const clearFilterGroup = useCallback((group) => {
    setFilters({ [group]: [] }, true);
  }, [setFilters]);

  const handleClearAll = async () => {
    try {
      if (clearTransientFiltersAtomic) {
        await clearTransientFiltersAtomic();
      } else {
        // fallback: reset store filters and clear url params
        resetFilters({ skipFetch: true });
        try { window.history.replaceState({}, "", window.location.pathname); } catch (e) {}
      }
    } catch (e) {}
  };

  // Sync filters -> URL (org, theme). Use replace to avoid polluting history.
  useEffect(() => {
    if (!setSearchParams) return;
    if (applyingUrlFilters) return; // don't sync while we're programmatically applying URL filters
    

    const currentOrg = searchParams.get("org");
    const currentTheme = searchParams.get("theme");

    const orgValues = Array.isArray(filters?.organizations) ? filters.organizations.map(o => o.value).filter(Boolean) : [];
    const tagValues = Array.isArray(filters?.tags) ? filters.tags.map(t => t.value).filter(Boolean) : [];

    const newOrg = orgValues.length ? orgValues.map(value => encodeURIComponent(value)).join(",") : null;
    const newTheme = tagValues.length ? tagValues.map(value => encodeURIComponent(value)).join(",") : null;

    // avoid updating if params equal
    const shouldUpdateOrg = (currentOrg || null) !== (newOrg || null);
    const shouldUpdateTheme = (currentTheme || null) !== (newTheme || null);

    if (!shouldUpdateOrg && !shouldUpdateTheme) return;

    const next = new URLSearchParams(searchParams.toString());
    if (newOrg) {
      next.set("org", newOrg);
    } else {
      if (currentOrg) suppressFromResourceOrgRestoreRef.current = true;
      next.delete("org");
    }
    if (newTheme) next.set("theme", newTheme); else next.delete("theme");

    // suppress tryClear briefly while we programmatically update the URL
    suppressTryClearRef.current = true;
    safeSetSearchParams(next, { replace: true });
    window.setTimeout(() => (suppressTryClearRef.current = false), 150);
  }, [filters, searchStr, applyingUrlFilters]);

  useEffect(() => {
    if (!filtersInitialized && !loadingList) setFiltersInitialized(true);
  }, [loadingList, filtersInitialized]);

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
  ? resources.slice(0, 6)
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
  
  // (Old org-only effect removed; handled by combined org/theme effect above)
  useEffect(() => {
    if (!masterList) {
      fetchMasterList();
    }
  }, [masterList, fetchMasterList]);

  useEffect(() => {
    if (
      !fromResourceParam ||
      orgParam ||
      !masterList ||
      suppressFromResourceOrgRestoreRef.current
    ) return;

    let cancelled = false;

    const resolveOrgFromResource = async () => {
      const resource =
        selectedMedia && String(selectedMedia.id) === String(fromResourceParam)
          ? selectedMedia
          : await fetchMediaDetail(fromResourceParam);

      if (cancelled || !resource?.organization) return;

      const orgDropdown = masterList.find((d) => d.key === "organizations");
      const match = orgDropdown?.options?.find(
        (option) =>
          String(option.value) === String(resource.organization) ||
          String(option.display || "").toLowerCase() === String(resource.organization).toLowerCase()
      );
      const orgValue = match?.value ?? resource.organization;
      const next = new URLSearchParams(searchParams.toString());
      next.set("org", orgValue);
      try {
        setSearchParams(next, { replace: true });
      } catch (e) {}
    };

    resolveOrgFromResource().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [
    fetchMediaDetail,
    fromResourceParam,
    masterList,
    orgParam,
    searchParams,
    selectedMedia,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!masterList || (!orgParam && !themeParam)) return;

    const orgDropdown = masterList.find((d) => d.key === "organizations");
    const tagDropdown = masterList.find((d) => d.key === "tags");

    const decodeFilterValue = (value) => {
      try {
        return decodeURIComponent(value.trim());
      } catch {
        return value.trim();
      }
    };

    const toSelectedOptions = (paramValue, options = []) =>
      String(paramValue || "")
        .split(",")
        .map(decodeFilterValue)
        .filter(Boolean)
        .map((value) => {
          const match = options.find(
            (option) =>
              String(option.value) === String(value) ||
              String(option.display || "").toLowerCase() === String(value).toLowerCase()
          );

          return {
            value: match?.value ?? value,
            display: match?.display ?? value,
          };
        });

    const nextFilters = {};
    if (orgParam) {
      nextFilters.organizations = toSelectedOptions(orgParam, orgDropdown?.options);
    }
    if (themeParam) {
      nextFilters.tags = toSelectedOptions(themeParam, tagDropdown?.options);
    }

    if (!Object.keys(nextFilters).length) return;

    setApplyingUrlFilters(true);
    setFilters(nextFilters, true, { skipFetch: true });
    fetchMediaList({}, true).finally(() => {
      setApplyingUrlFilters(false);
      setFiltersInitialized(true);
    });
  }, [
    fetchMasterList,
    fetchMediaList,
    masterList,
    orgParam,
    setApplyingUrlFilters,
    setFilters,
    themeParam,
  ]);
   
  return (
    <div
  className={`relative overflow-hidden py-5 lg:py-12 w-full scroll-mt-24 ${
    compact || displayedResources.length === 0 ? "" : "min-h-screen"
  }`}
  data-browse-resources
>
      <div
        className="absolute inset-0 z-0 pointer-events-none"
      />
      <section
  className={`relative z-10 max-w-[93.75rem] mx-auto ${
    compact || displayedResources.length === 0 ? "" : "min-h-screen"
  }`}
>
<div className="w-full px-4 sm:px-6 lg:px-0 lg:w-[92.5%] mx-auto">
        {/* ⬇️ EVERYTHING BELOW IS EXACT SAME (no change) */}

<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
  <div
  className="flex items-start justify-between gap-4 mb-3 md:mb-0"
  data-browse-resources
>
  <div className="flex-1 min-w-0">
    <h2 className="text-xl sm:text-[1.375rem] font-comfortaa font-semibold tracking-[0.0625rem] text-repository-heading capitalize break-words">
      {selectedSingleLabel
        ? `${selectedSingleLabel.name} Resources`
        : t(title ?? "repository.browseResources")}
    </h2>

    {!compact && (
      <p
        className="
          font-sourceSans
          font-medium
          text-[0.875rem]
          leading-[1.3125rem]
          text-repository-body
        "
      >
        {t("repository.browseResourcesDescription")}
      </p>
    )}

  </div>

  {compact && (
  <button
    type="button"
    onClick={() => {
  resetFilters();
  safeSetSearchParams(new URLSearchParams(), { replace: true });
  navigate(ROUTES.SHIKSHAGRAHA_REPOSITORY_LIST);
}}
    className="
      flex sm:hidden
      items-center justify-center gap-1
      w-[7.5rem]
      h-[2.25rem]
      px-1 py-2
      rounded-[0.5rem]
      bg-repository-primary
      hover:opacity-90
      transition-all
      flex-shrink-0
    "
  >
    <span className="font-medium text-[0.8125rem] leading-[1.25rem] text-white">
      {t("repository.browseAll")}
    </span>

    <ArrowRight className="w-4 h-4 text-white" />
  </button>
)}
</div>


  {compact ? (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full md:w-auto">
      <Dropdown
  options={sortOptions}
  selectedValue={sortBy}
  onSelect={(value) => {
    setSortBy(value);
  }}
  renderButton={(selected) => (
  <span className="whitespace-nowrap font-inter text-[0.75rem] leading-[1.125rem] flex items-center">
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
  onClick={() => {
  resetFilters();
  safeSetSearchParams(new URLSearchParams(), { replace: true });
  navigate(ROUTES.SHIKSHAGRAHA_REPOSITORY_LIST);
}}
  className="
  hidden sm:flex
  items-center justify-center gap-1
  w-[7.5rem]
  h-[2.25rem]
  px-1 py-2
  rounded-[0.5rem]
  bg-repository-primary
  hover:opacity-90
  transition-all
  flex-shrink-0
"
>
  <span
    className="
      font-medium
      text-[0.8125rem]
      leading-[1.25rem]
      text-white
    "
  >
    {t("repository.browseAll")}
  </span>

  <ArrowRight className="w-4 h-4 text-white" />
</button>
    </div>
  ) : (
    <div className="flex flex-col gap-4 w-full lg:w-auto lg:flex-row lg:items-center lg:flex-nowrap lg:shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-3 w-full lg:flex-nowrap lg:w-auto lg:justify-start lg:gap-6 lg:shrink-0">
        <div className="whitespace-nowrap font-inter text-[0.75rem] leading-[1.125rem]">
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
  <span className="whitespace-nowrap font-inter text-[0.75rem] leading-[1.125rem]">
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

<div className="flex items-center justify-between w-full lg:w-auto lg:flex-nowrap lg:justify-end lg:gap-6 lg:shrink-0">
<div className="flex items-center gap-3 shrink-0">
          <button
  onClick={() => setViewMode("grid")}
  className={`
    flex items-center justify-center
    w-[1.7556rem]
    h-[1.8656rem]
    rounded-[0.4389rem]
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
  className={`w-[0.875rem] h-[0.875rem]`}
/>
</button>
      <button
  type="button"
  onClick={() => setViewMode("list")}
  className={`
    flex items-center justify-center
    w-[1.7556rem]
    h-[1.8656rem]
    rounded-[0.4389rem]
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
  className={`w-[0.875rem] h-[0.875rem]`}
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
  shrink-0
  [&>div>button]:min-w-[5.5rem]
  [&>div>button]:w-auto
  [&>div>button]:justify-between
  [&>div>button]:border
  [&>div>button]:border-repository-controlBorder
  [&>div>button]:rounded-[0.5487rem]
  [&>div>button]:bg-white
  [&>div>button]:px-3
"
  dropdownClassName="w-[5.5rem]"
  renderButton={(selected) => (
    <span
  className="
    font-inter
    font-normal
    text-[0.7682rem]
    leading-[1.125rem]
    text-repository-textPrimary
    flex
    items-center
  "
>
  <span className="whitespace-nowrap">{selected?.label || "6"} {t("repository.items")}</span>
</span>
  )}
/>
        <div className="shrink-0">
  <Filters />
</div>
      </div>
    </div>
  )}
</div>

          {/* Group chips row (Organization, Theme, etc.) */}
          <div className="mt-6 mb-10 flex w-full items-center gap-3 sm:mt-8 sm:mb-14 sm:gap-4">
            <div className="flex-1 overflow-x-auto">
              <div className="flex w-max items-center gap-3 pr-4 sm:gap-6">
                {filterGroupChips.map((chip) => (
                  <div
                    key={chip.group}
                    className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[0.625rem] bg-[var(--listing-filter-chip-background)] p-2 text-[var(--listing-filter-chip-text)] opacity-100 transition hover:bg-[var(--listing-filter-chip-background-hover)] sm:h-10 sm:max-w-none sm:gap-2.5 sm:p-2.5"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("sg-open-filter-group", { detail: { group: chip.group } })
                        )
                      }
                      className="flex min-w-0 items-center gap-1.5"
                    >
                      <span className="shrink-0 font-sourceSans text-[0.8125rem] font-bold leading-4 tracking-[0.01em] text-right sm:text-[0.9644rem] sm:leading-[1.125rem]">
                        {chip.label}:
                      </span>
                      <span className="min-w-0 truncate font-sourceSans text-[0.8125rem] font-normal leading-4 tracking-[0.01em] text-right sm:hidden">
                        {chip.mobileDisplay}
                      </span>
                      <span className="hidden min-w-0 truncate font-sourceSans text-[0.9644rem] font-normal leading-[1.125rem] tracking-[0.01em] text-right sm:inline">
                        {chip.display}
                      </span>
                      {chip.mobileOverflowLabel && (
                        <span className="shrink-0 font-sourceSans text-[0.8125rem] font-normal leading-4 tracking-[0.01em] text-right sm:hidden">
                          , {chip.mobileOverflowLabel}
                        </span>
                      )}
                      {chip.overflowLabel && (
                        <span className="hidden shrink-0 font-sourceSans text-[0.9644rem] font-normal leading-[1.125rem] tracking-[0.01em] text-right sm:inline">
                          , {chip.overflowLabel}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      aria-label={`Clear ${chip.label}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        try {
                          setFilters({ [chip.group]: [] }, true);
                          const paramMap = {
                            organizations: ["org"],
                            tags: ["theme"],
                            resource_types: ["resource_types", "resource_type"],
                            resource_type: ["resource_type", "resource_types"],
                            file_types: ["file_type", "filetype"],
                            filetype: ["filetype", "file_type"],
                            media_types: ["media_types", "media_type"],
                          };
                          const params = paramMap[chip.group] || [];
                          const next = new URLSearchParams(searchParams.toString());
                          if (chip.group === "organizations") {
                            suppressFromResourceOrgRestoreRef.current = true;
                          }
                          params.forEach((param) => next.delete(param));
                          try { setSearchParams(next, { replace: true }); } catch (err) { }
                        } catch (err) {
                          // ignore
                        }
                      }}
                      className="ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center text-[var(--listing-danger)] transition hover:opacity-75"
                    >
                      <X className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {filterGroupChips.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="ml-auto shrink-0 self-center font-sourceSans text-[0.9644rem] font-normal leading-[1.125rem] tracking-[0.01em] text-right text-[var(--listing-secondary)] underline decoration-[var(--listing-secondary)] decoration-1 underline-offset-0.5"
              >
                {t("repository.filters.clearAll")}
              </button>
            )}
          </div>

        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 z-0 pointer-events-none"
          />
          <div className="relative z-10">
            <div className="flex gap-0 md:!gap-6 items-stretch justify-start md:justify-center">
<div
  className={`grid w-full
  ${
    viewMode === "grid"
      ? "gap-9 md:gap-x-4 md:gap-y-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : "gap-3 grid-cols-1"
  }
  ${
    cardsSpacing ? "px-2 sm:px-4 md:px-6 lg:px-16" : "px-2 sm:px-0"
  }`} aria-busy={!filtersInitialized}>
    {filtersInitialized ? (
      displayedResources.map((resource, index) => (
        <React.Fragment key={`resource-${resource.id}-${index}`}>
          <ResourceCard
            key={resource.id}
            resource={resource}
            index={index}
            viewMode={viewMode}
          />
        </React.Fragment>
      ))
    ) : (
      // lightweight skeleton placeholders to prevent layout jump
      Array.from({ length: viewMode === 'grid' ? 6 : 3 }).map((_, i) => (
        <div key={`skeleton-${i}`} className="w-full h-40 bg-gray-200 rounded-lg animate-pulse" />
      ))
    )}
  </div>
            </div>
          </div>
        </div>
</div>
      </section>
    </div>
  );
}
