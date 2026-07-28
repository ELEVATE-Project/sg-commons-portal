import React, { useEffect, useRef, useState, useCallback } from "react";
import BrowseResources from "./BrowseResources.jsx";
import Pagination from "./Pagination.jsx";
import Footer from "../../../components/footer/Footer.jsx";
import MitraAiAssistantAside from "./MitraAiAssistantAside.jsx";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore.js";
import { GrResources } from "react-icons/gr";
import { useTranslation } from "react-i18next";
import { theme } from "../../../theme";
import PageHeader from "../../../components/PageHeader";
import left1 from "assets/dandelion-left-1.png";
import right2 from "assets/dandelion-right-2.png";
import { useLocation, useNavigationType, useSearchParams } from "react-router-dom";
import BrowseResourcesGrid from "./BrowseResourcesGrid";

const LISTING_RESOURCE_LIMIT = 6;

export default function RepositoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState(
  searchParams.get("view") || "grid"
);
  const loadingList = useRepositoryStore((state) => state.loadingList);
const loadingDetail = useRepositoryStore((state) => state.loadingDetail);
const loadingMaster = useRepositoryStore((state) => state.loadingMaster);

  const { t } = useTranslation()

  const mediaList = useRepositoryStore((state) => state.mediaList);
  const showBlockingLoader =
    loadingList || loadingDetail || loadingMaster;
  const q = useRepositoryStore((state) => state.q);
  const searchInput = useRepositoryStore((state) => state.searchInput);
  const setSearch = useRepositoryStore((state) => state.setSearch);

  const mediaCount = useRepositoryStore((state) => state.mediaCount);
  const filters = useRepositoryStore((state) => state.filters);
  const hasAppliedFilters =
  Object.values(filters || {}).some((value) =>
    Array.isArray(value)
      ? value.length > 0
      : value !== null && value !== undefined && value !== ""
  );
  const pagination = useRepositoryStore((state) => state.pagination);
  const setPagination = useRepositoryStore((state) => state.setPagination);
  const sortBy = useRepositoryStore((state) => state.sortBy);
  const itemsPerPage = pagination.limit;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const navigationType = useNavigationType();
  const hasRestoredScrollRef = useRef(false);
  const hasInitializedPageSizeRef = useRef(false);
  const previousResultSetKeyRef = useRef(null);
  const skipNextUrlSearchSyncRef = useRef(false);
  const skipNextSnapshotStampRef = useRef(false);
  const skipNextResultSetResetRef = useRef(false);
  const pageParam = searchParams.get("page") || "1";
  const limitParam = Number(searchParams.get("limit"));
  const searchParamsString = searchParams.toString();
  const hasRepositoryUrlFilters =
    searchParams.has("org") ||
    searchParams.has("categories") ||
    searchParams.has("fromResource");
  const fixedTopRef = useRef(null);
  const [fixedTopHeight, setFixedTopHeight] = useState(0);
  const footerRef = useRef(null);
const [headerOffset, setHeaderOffset] = useState(0);
const scrollContainerRef = useRef(null);

  useEffect(() => {
    const node = fixedTopRef.current;
    if (!node) return;

    const updateHeight = () => setFixedTopHeight(node.offsetHeight);
    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(node);

    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [isMobile, viewMode, mediaList, showBlockingLoader]);
  // ----------------------------------------------------------------------

  useEffect(() => {
  if (!footerRef.current) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setHeaderOffset(entry.intersectionRect.height);
      } else {
        setHeaderOffset(0);
      }
    },
    {
      threshold: Array.from({ length: 101 }, (_, i) => i / 100),
    }
  );

  observer.observe(footerRef.current);

  return () => observer.disconnect();
}, []);

    useEffect(() => {
  const fromDetail = !!location.state?.repositorySnapshot;

  if (!fromDetail && navigationType !== "POP") {
    window.scrollTo(0, 0);
  }
}, [location.key, navigationType, location.state]);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);

  useEffect(() => {
    const snapshot = location.state?.repositorySnapshot;
    if (navigationType !== "POP" || !snapshot) return;

    skipNextUrlSearchSyncRef.current = true;
    skipNextSnapshotStampRef.current = true;
    skipNextResultSetResetRef.current = true;
    useRepositoryStore.getState().replaceRepositoryQueryState(snapshot);
  }, [location.key, location.state, navigationType]);

  useEffect(() => {
    if (skipNextSnapshotStampRef.current) {
      skipNextSnapshotStampRef.current = false;
      return;
    }

    const snapshot = useRepositoryStore.getState().getRepositoryQuerySnapshot();
    const historyState = window.history.state || {};
    const nextRouterState = {
      ...(historyState.usr || {}),
      repositorySnapshot: snapshot,
    };

    window.history.replaceState(
      { ...historyState, usr: nextRouterState },
      "",
      window.location.href
    );
  }, [filters, q, searchInput, pagination, sortBy]);

  useEffect(() => {
    const rawPage = Number(pageParam);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const targetLimit =
  Number.isFinite(limitParam) && limitParam > 0
    ? limitParam
    : LISTING_RESOURCE_LIMIT;
    const nextOffset = (page - 1) * targetLimit;

    hasInitializedPageSizeRef.current = true;

    if (pagination.limit === targetLimit && pagination.offset === nextOffset) {
      return;
    }

    setPagination({
      offset: nextOffset,
      limit: targetLimit,
    });
  }, [pageParam, limitParam, pagination.offset, setPagination]);

  useEffect(() => {
    const resultSetKey = JSON.stringify({ filters, q });

    if (skipNextResultSetResetRef.current) {
      skipNextResultSetResetRef.current = false;
      previousResultSetKeyRef.current = resultSetKey;
      return;
    }

    if (previousResultSetKeyRef.current === null) {
      previousResultSetKeyRef.current = resultSetKey;
      return;
    }

    if (previousResultSetKeyRef.current === resultSetKey) return;

    previousResultSetKeyRef.current = resultSetKey;

    if (pageParam !== "1") {
      const next = new URLSearchParams(searchParamsString);
      const trimmedSearch = q.trim();
      if (trimmedSearch) {
        next.set("searchResourceText", trimmedSearch);
      } else {
        next.delete("searchResourceText");
      }
      next.delete("searchText");
      next.set("page", "1");
      setSearchParams(next, { replace: true });
    }

    if (pagination.offset !== 0) {
      setPagination({ offset: 0, limit: pagination.limit });
    }
  }, [
    filters,
    pageParam,
    pagination.limit,
    pagination.offset,
    q,
    searchParamsString,
    setPagination,
    setSearchParams,
  ]);

  useEffect(() => {
  const params = new URLSearchParams(searchParams);

  if (viewMode === "grid") {
    params.delete("view");
  } else {
    params.set("view", viewMode);
  }

  setSearchParams(params, { replace: true });
}, [viewMode]);

useEffect(() => {
  const snapshot = location.state?.repositorySnapshot;
  if (navigationType !== "POP" || !snapshot) return;

  skipNextUrlSearchSyncRef.current = true;
  skipNextSnapshotStampRef.current = true;
  skipNextResultSetResetRef.current = true;

  hasRestoredScrollRef.current = false;

  useRepositoryStore
    .getState()
    .replaceRepositoryQueryState(snapshot)
    .then(() => {
      restoreScrollPosition(snapshot.repositoryScrollY);
    });
}, [location.key, location.state, navigationType]);

const restoreScrollPosition = useCallback((repositoryScrollY) => {
  if (hasRestoredScrollRef.current) return;

  let cancelled = false;
  let rafId = null;
  let tries = 0;
  let lastHeight = -1;
  let stableFrames = 0;

  const { lastOpenedResourceId } = useRepositoryStore.getState();

  const attempt = () => {
    if (cancelled) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    const currentHeight = el.scrollHeight;
    if (currentHeight === lastHeight) {
      stableFrames++;
    } else {
      stableFrames = 0;
      lastHeight = currentHeight;
    }

    if (stableFrames < 3 && tries < 60) {
      tries++;
      rafId = requestAnimationFrame(attempt);
      return;
    }

    const targetEl = lastOpenedResourceId
      ? document.getElementById(`resource-${lastOpenedResourceId}`)
      : null;

    if (targetEl) {
      targetEl.scrollIntoView({ block: "center" });
    } else {
      el.scrollTop = repositoryScrollY;
    }

    hasRestoredScrollRef.current = true;
    useRepositoryStore.getState().setRepositoryScrollY(0);
  };

  rafId = requestAnimationFrame(attempt);

  return () => {
    cancelled = true;
    if (rafId) cancelAnimationFrame(rafId);
  };
}, []);

  useEffect(() => {
    if (skipNextUrlSearchSyncRef.current) {
      skipNextUrlSearchSyncRef.current = false;
      return;
    }

    // Only URL changes should drive search state, otherwise local submit/clear races.
    const currentParams = new URLSearchParams(location.search);
    const urlQuery =
      currentParams.get("searchResourceText") ||
      currentParams.get("searchText") ||
      "";
    const trimmedUrlQuery = urlQuery.trim();
    const restoredRepositoryEntry =
      navigationType === "POP" && location.state?.repositorySnapshot;

    if (!trimmedUrlQuery && restoredRepositoryEntry) {
      return;
    }

    const { q: currentSearch, searchInput: currentSearchInput } =
      useRepositoryStore.getState();

    if (trimmedUrlQuery) {
      if (
        currentSearch !== trimmedUrlQuery ||
        currentSearchInput !== trimmedUrlQuery
      ) {
        setSearch(trimmedUrlQuery);
      }

      if (currentParams.has("searchText")) {
        const next = new URLSearchParams(currentParams.toString());
        next.delete("searchText");
        next.set("searchResourceText", trimmedUrlQuery);
        setSearchParams(next, { replace: true });
      }
    } else if (currentSearch || currentSearchInput) {
      setSearch("");
    }
  }, [location.search, location.state, navigationType, setSearch, setSearchParams]);

useEffect(() => {
  if (navigationType === "POP") return;

  if (!!mediaList?.length && q && !loadingList) {
    const browseSection = document.querySelector("[data-browse-resources]");

    browseSection?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}, [mediaList, q, loadingList, navigationType]);

  return (
    <div
  className="bg-white relative listing-pages overflow-x-hidden"
  style={{
    ...theme.vars,
    backgroundImage: `url(${left1}), url(${right2})`,
    backgroundPosition: isMobile
      ? "left -2rem top 12rem, right -2rem top 20rem"
      : "left 2.8rem top 24.5rem, right 1.7rem top 32.5rem",
    backgroundRepeat: "no-repeat",
    backgroundSize: isMobile
      ? "5rem, 6rem"
      : "8rem, 10rem",
    backgroundAttachment: "fixed",
  }}
>
<div
  ref={fixedTopRef}
  className="fixed top-0 left-0 right-0 z-40 bg-white transition-transform duration-150"
  style={{
    height: isMobile
  ? hasAppliedFilters
    ? "50vh"
    : "44vh"
  : hasAppliedFilters
    ? "43vh"
    : "33vh",
    transform: `translateY(-${headerOffset}px)`,
    marginBottom: "-1rem",
  }}
>
        <div className="container max-w-[93.75rem] mx-auto">
          <div className="w-full sm:px-6 lg:px-0 lg:w-[96.3%] mx-auto pt-3">
            <PageHeader showSearch />
          </div>
          <BrowseResources
            resources={mediaList}
            compact={false}
            title="repository.browseResources"
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>
      </div>

      <div
  id="repository-scroll-container"
  ref={scrollContainerRef}
  className="overflow-y-auto"
  style={{
    paddingTop: fixedTopHeight,
    height: "100vh",
  }}
>
        <div className="container max-w-[93.75rem] mx-auto">
          <div className="min-h-screen pb-3 flex flex-col align-items-center gap-4">
            <div className="">
              <main className="w-full mx-auto">
                <BrowseResourcesGrid
                  displayedResources={mediaList}
                  viewMode={viewMode}
                  cardsSpacing={true}
                  setViewMode={setViewMode}
                  filtersInitialized={true}
                />

                {!showBlockingLoader && !mediaList?.length && (
                  <div className="w-full pt-10 mx-auto flex flex-col items-center justify-center">
                    <div className="text-muted">
                      <GrResources size={100} />
                    </div>
                    <div className="flex flex-col items-center justify-center p-4">
                      <h2 className="text-lg py-2 text-center">{t("noResourceFoundTitle")}</h2>
                    </div>
                  </div>
                )}
                {!loadingList && (
                  <div className="w-full mt-6 mx-auto">
                    <Pagination
                      resourcesPerPage={itemsPerPage}
                      totalResources={mediaCount}
                      selectedPage={Number(searchParams.get("page") || 1) - 1}
                      paginate={(page) => {

  if (scrollContainerRef.current) {
    scrollContainerRef.current.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const params = new URLSearchParams(searchParams);
  params.set("page", page + 1);

  setSearchParams(params);
}}
                    />
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>

        <MitraAiAssistantAside />

        <div ref={footerRef}>
  <Footer />
</div>
      </div>

      {showBlockingLoader && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-black bg-opacity-75 text-white h-screen">
          {t("common.loadingText")}
        </div>
      )}
    </div>
  );
}