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
  const fetchMasterList = useRepositoryStore((state) => state.fetchMasterList);
  const masterList = useRepositoryStore((state) => state.masterList);
  const fetchMediaList = useRepositoryStore((state) => state.fetchMediaList);
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
  const searchStr = searchParams.toString();
  const suppressTryClearRef = useRef(false);
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
  }, [filters]);
  // Sync filters -> URL (org, theme). Use replace to avoid polluting history.
  useEffect(() => {
    if (!setSearchParams) return;
    if (applyingUrlFilters) return; // don't sync while we're programmatically applying URL filters
    

    const currentOrg = searchParams.get("org");
    const currentTheme = searchParams.get("theme");

    const orgValues = Array.isArray(filters?.organizations) ? filters.organizations.map(o => o.value).filter(Boolean) : [];
    const tagValues = Array.isArray(filters?.tags) ? filters.tags.map(t => t.value).filter(Boolean) : [];

    const newOrg = orgValues.length ? orgValues.join(",") : null;
    const newTheme = tagValues.length ? tagValues.join(",") : null;

    // avoid updating if params equal
    const shouldUpdateOrg = (currentOrg || null) !== (newOrg || null);
    const shouldUpdateTheme = (currentTheme || null) !== (newTheme || null);

    if (!shouldUpdateOrg && !shouldUpdateTheme) return;

    const next = new URLSearchParams(searchParams.toString());
    if (newOrg) next.set("org", newOrg); else next.delete("org");
    if (newTheme) next.set("theme", newTheme); else next.delete("theme");

    // suppress tryClear briefly while we programmatically update the URL
    suppressTryClearRef.current = true;
    safeSetSearchParams(next, { replace: true });
    window.setTimeout(() => (suppressTryClearRef.current = false), 150);
  }, [filters, searchStr, applyingUrlFilters]);

  // Apply URL -> filters: when `org` or `theme` present in URL, map them
  // to masterList options and set filters accordingly. If masterList is
  // not yet available, attempt to fetch it and wait for the effect to re-run.
  useEffect(() => {
    
    if (!orgParam && !themeParam) return;

    const safeDecode = (s) => {
      try {
        return decodeURIComponent(s);
      } catch (e) {
        return s;
      }
    };

    // If masterList isn't available yet, fetch it but still apply URL params
    // immediately using raw values so the store reflects the URL on first render.
    if (!masterList) {
      setApplyingUrlFilters(true);
      fetchMasterList?.();
      // continue — we'll map URL values into filters below using raw values
    }

    const orgValues = orgParam ? orgParam.split(",").map((s) => safeDecode(s).trim()).filter(Boolean) : [];
    const themeValues = themeParam ? themeParam.split(",").map((s) => safeDecode(s).trim()).filter(Boolean) : [];

    const orgDropdown = masterList?.find((d) => d.key === "organizations") ?? null;
    const tagDropdown = masterList?.find((d) => d.key === "tags") ?? null;

    const orgs = orgValues.map((v) => {
      const match = orgDropdown?.options?.find((o) => String(o.value) === String(v) || String((o.display || "")).toLowerCase() === String(v).toLowerCase());
      return { value: match?.value ?? v, display: match?.display ?? v };
    });

    const tags = themeValues.map((v) => {
      const match = tagDropdown?.options?.find((o) => String(o.value) === String(v) || String((o.display || "")).toLowerCase() === String(v).toLowerCase());
      return { value: match?.value ?? v, display: match?.display ?? v };
    });

    // If current filters already match derived URL filters, skip setting them
    const curOrgs = (filters?.organizations || []).map((o) => String(o?.value ?? o)).filter(Boolean);
    const curTags = (filters?.tags || []).map((t) => String(t?.value ?? t)).filter(Boolean);
    const derivedOrgs = orgs.map((o) => String(o?.value ?? o)).filter(Boolean);
    const derivedTags = tags.map((t) => String(t?.value ?? t)).filter(Boolean);

    const sameOrgs = JSON.stringify(curOrgs) === JSON.stringify(derivedOrgs);
    const sameTags = JSON.stringify(curTags) === JSON.stringify(derivedTags);
    if (sameOrgs && sameTags) {
    
      return;
    }

    // start hidden while we apply URL filters and fetch
    
    setFiltersInitialized(false);
    // indicate we're applying URL-driven filters so other effects don't react
    setApplyingUrlFilters(true);
    // set filters without triggering an immediate fetch; we'll fetch once below
    setFilters({ organizations: orgs, tags }, true, { skipFetch: true });
    // trigger a single immediate fetch to apply mapped URL filters and then clear flag
    fetchMediaList({}, true).then(() => setApplyingUrlFilters(false)).catch(() => setApplyingUrlFilters(false));
  }, [orgParam, themeParam, masterList, fetchMasterList, setFilters, fetchMediaList, searchStr]);

  // When the list finishes loading after applying URL filters, reveal grid
  useEffect(() => {
    if (!filtersInitialized && !loadingList) {
      setFiltersInitialized(true);
    }
  }, [loadingList, filtersInitialized]);

  // Ensure URL params are fully cleared when there are no active filters.
  // This runs on mount and on browser back navigation (popstate) so params
  // like `org`, `theme`, or `fromResource` don't linger when filters are empty.
  useEffect(() => {
    const handlePopstateOrMount = async (e) => {
      const isInitialMount = e == null;
      if (suppressTryClearRef.current) return;
      if (applyingUrlFilters) {
        window.setTimeout(() => {
          try { handlePopstateOrMount(e); } catch {}
        }, 200);
        return;
      }

      // If the popstate indicates we came from a detail page, clear transient filters first
      try {
        const s = (e && e.state) || window.history.state || {};
        const urlParams = new URLSearchParams(window.location.search || "");
        const hasFromResourceInUrl = Boolean(urlParams.get("fromResource"));
        if (!isInitialMount && ((s && s.fromDetail) || hasFromResourceInUrl)) {
          await clearTransientFiltersAtomic({ navigateToResourceId: undefined });
          return;
        }
      } catch {}

      // read directly from window.location to avoid stale hook values during popstate
      const currentParams = new URLSearchParams(window.location.search || '');
      const currentSearch = currentParams.toString();
      
      const paramKeys = ["org", "theme", "resource_type", "resource_types", "media_type", "media_types", "file_type", "filetype", "tags", "fromResource"];
      const hasAny = paramKeys.some((k) => Boolean(currentParams.get(k)));

      const isEmptyFilterValue = (v) => {
        if (v == null) return true;
        if (Array.isArray(v)) return v.length === 0;
        if (typeof v === "string") return v.trim() === "";
        if (typeof v === "object") return Object.keys(v).length === 0;
        return !v;
      };

      const noFilters = Object.keys(filters || {}).length === 0 || Object.values(filters || {}).every(isEmptyFilterValue);

      // If we recently navigated from a detail page, treat URL params as transient and clear them.
      try {
        const raw = sessionStorage.getItem && sessionStorage.getItem('sg:lastFromDetail');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const recent = parsed && parsed.ts && (Date.now() - parsed.ts < 30000);
            if (recent && hasAny && !isInitialMount) {
              try { clearTransientFiltersAtomic(); } catch {}
              try { sessionStorage.removeItem('sg:lastFromDetail'); } catch {}
              return;
            }
            if (!recent) { try { sessionStorage.removeItem('sg:lastFromDetail'); } catch {} }
          } catch { try { sessionStorage.removeItem('sg:lastFromDetail'); } catch {} }
        }
      } catch {}

      // Case A: noFilters && hasAny -> URL has params but store empty: remove URL params
      if (noFilters && hasAny) {
        try { console.log('[BrowseResources] decision noFilters && hasAny', { noFilters, hasAny, isInitialMount }); } catch (err) {}
        if (isInitialMount) return;
        try { clearTransientFiltersAtomic(); } catch {}
        return;
      }

      // Case B: URL has no params but store has filters -> reset store filters
      if (!hasAny && !noFilters) {
        setFiltersInitialized(false);
        if (isInitialMount) return;
        try { clearTransientFiltersAtomic(); } catch {}
        return;
      }
    };

    // initial attempt (mount)
    handlePopstateOrMount(null);
    window.addEventListener("popstate", handlePopstateOrMount);
    return () => window.removeEventListener("popstate", handlePopstateOrMount);
  }, [filters, applyingUrlFilters, clearTransientFiltersAtomic]);
  
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
  
  // (Old org-only effect removed; handled by combined org/theme effect above)
   
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
  className={`relative z-10 max-w-[93.75rem] mx-auto ${
    compact ? "" : "min-h-screen"
  }`}
>
<div className="w-full lg:w-[92.5%] mx-auto">
        {/* ⬇️ EVERYTHING BELOW IS EXACT SAME (no change) */}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
  <div className="w-full mb-3 md:mb-0" data-browse-resources>
      <h2 className="text-[1.25rem] md:text-[1.375rem] font-['Comfortaa'] font-semibold tracking-[0.0625rem] text-repository-heading capitalize">

      {selectedSingleLabel ? `${selectedSingleLabel.name} Resources` : t(title ?? "repository.browseResources")}
    </h2>

    {!compact && (
      <p
  className="
    font-['Source_Sans_3']
    font-medium
    text-[0.875rem]
    leading-[1.3125rem]
    text-repository-body
  "
>
  {t("repository.browseResourcesDescription")}
</p>
    )}
    {/* Conditional single filter label (Organisation or Theme) */}
    {selectedSingleLabel && (
      <p className="mt-2 text-sm text-repository-textSecondary flex items-center gap-2">
        <span>{selectedSingleLabel.type}: {selectedSingleLabel.name}</span>
        {(selectedSingleLabel.type === "Organisation" || selectedSingleLabel.type === "Theme") && (
          <button
            type="button"
            aria-label={`Clear ${selectedSingleLabel.type.toLowerCase()}`}
            className="p-1 rounded hover:bg-gray-100"
            onClick={async () => {
              const fromResource = searchParams.get("fromResource") || (window.history.state && window.history.state.fromResource);
              
              try {
                const clearAtomic = useRepositoryStore.getState().clearTransientFiltersAtomic;
                if (clearAtomic) await clearAtomic();
              } catch (e) {
                try { await clearTransientFiltersAtomic({ navigateToResourceId: fromResource || undefined }); } catch (er) {}
              }
            }}
          >
            <X className="w-4 h-4 text-repository-textSecondary" />
          </button>
        )}
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
  <span className="whitespace-nowrap font-['Inter'] text-[0.75rem] leading-[1.125rem] flex items-center">
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
    try { safeSetSearchParams(new URLSearchParams(), { replace: true }); } catch (e) {}
    // Do not call clearTransientFiltersAtomic or fetch here —
    // the URL change will trigger the BrowseResources tryClear effect
    // which will clear store filters and perform a single fetch.
    navigate(ROUTES.SHIKSHAGRAHA_REPOSITORY_LIST);
  }}
  className="
    flex items-center justify-center gap-1
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
    <div className="flex flex-col md:flex-row items-center gap-6 w-full">
      <div className="flex items-center justify-between lg:justify-end w-full lg:gap-6">
        <div className="whitespace-nowrap font-['Inter'] text-[0.75rem] leading-[1.125rem]">
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
  <span className="whitespace-nowrap font-['Inter'] text-[0.75rem] leading-[1.125rem]">
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

      <div className="flex items-center justify-between flex-row-reverse lg:flex-row lg:justify-start lg:gap-2 w-full lg:w-auto">
        <div className="flex items-center gap-1">
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
    [&>div>button]:w-[5.5rem]
    [&>div>button]:h-[1.8656rem]
    [&>div>button]:border
    [&>div>button]:border-repository-controlBorder
    [&>div>button]:rounded-[0.5487rem]
    [&>div>button]:bg-white
    [&>div>button]:px-3
    [&>div>button]:justify-between
  "
  dropdownClassName="w-[5.5rem]"
  renderButton={(selected) => (
    <span
  className="
    font-['Inter']
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
        <Filters />
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
              <div className={`grid gap-6 w-full ${
    viewMode === "grid"
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1"
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
          <div className="hidden lg:block w-[20%] self-stretch p-4 rounded-xl z-[9999]">
            <MitraAiAssistantAside />
          </div>
        </div>
</div>
      </section>
    </div>
  );
}
