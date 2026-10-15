import React, { useEffect, useRef, useState } from "react";
import Header from "../../../components/header/Header.jsx";
import BrowseResources from "../listing/BrowseResources.jsx";
import Footer from "../../../components/footer/Footer.jsx";
import MitraAiAssistantAside from "../listing/MitraAiAssistantAside.jsx";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore.js";
import { useLocation, useSearchParams } from "react-router-dom";
import { GrResources } from "react-icons/gr";
import { useTranslation } from "react-i18next";
import { theme } from "../../../theme";
import ExploreByTheme from "../listing/ExploreByTheme";
import { useNavigationType } from "react-router-dom";
import BrowseResourcesGrid from "../listing/BrowseResourcesGrid";
export default function RepositoryPage() {
  const { loadingList, loadingDetail, loadingMaster } = useRepositoryStore();

  const { t } = useTranslation()
  const hasClearedInitialSearchRef = useRef(false);

  const mediaList = useRepositoryStore((state) => state.mediaList);
  const showBlockingLoader =
    loadingList || loadingDetail || loadingMaster;
  const q = useRepositoryStore((state) => state.q);
  const searchInput = useRepositoryStore((state) => state.searchInput);
  const setSearch = useRepositoryStore((state) => state.setSearch);
  const resetFilters = useRepositoryStore((state) => state.resetFilters);

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigationType = useNavigationType();
  const hasRestoredScrollRef = useRef(false);
  const loaderSeenRef = useRef(false);
  const noLoaderWaitsRef = useRef(0);
  const [scrollTick, setScrollTick] = useState(0);
  // NOTE: Do not auto-clear `org`/`theme` params on initial mount. Listing
  // (`BrowseResources`) handles mapping URL -> filters and will control when
  // to clear transient params (on Back / clear actions). This effect was
  // previously removing URL params on mount which caused filters to disappear
  // on hard refresh; keep URL params intact so filters persist across refresh.

  useEffect(() => {
    if (hasClearedInitialSearchRef.current) return;
    hasClearedInitialSearchRef.current = true;

    const urlSearch =
      searchParams.get("searchResourceText") ||
      searchParams.get("searchText");
    if (!urlSearch && (q || searchInput)) {
      setSearch("");
    }
  }, [q, searchInput, searchParams, setSearch]);

  // If there are no org/theme params in URL, ensure repository filters are cleared
  useEffect(() => {
    const org = searchParams.get("org");
    const categories = searchParams.get("categories");
    if (!org && !categories) {
      try {
        const forceReset = useRepositoryStore.getState().forceResetFilters;
        if (forceReset) {
          forceReset();
        } else {
          resetFilters();
        }
      } catch {
        resetFilters();
      }
    }
  }, [searchParams, resetFilters]);


  useEffect(() => {
  if (navigationType === "POP") return;
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}, [navigationType, location.key]);

useEffect(() => {
  const history = window.history;
  if (!history || !("scrollRestoration" in history)) return;

  const previous = history.scrollRestoration;
  history.scrollRestoration = "manual";

  return () => {
    history.scrollRestoration = previous;
  };
}, []);

useEffect(() => {
  if (navigationType !== "POP") return;
  if (hasRestoredScrollRef.current) return;
  if (showBlockingLoader) {
    loaderSeenRef.current = true;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    return;
  }
  if (!loaderSeenRef.current && noLoaderWaitsRef.current < 4) {
    noLoaderWaitsRef.current += 1;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const timer = setTimeout(() => setScrollTick((n) => n + 1), 120);
    return () => clearTimeout(timer);
  }

  if (!mediaList?.length) return;

  let tries = 0;
  let lastHeight = -1;
  let stableFrames = 0;
  let rafId;

  const restore = () => {
    const currentHeight = document.documentElement.scrollHeight;

    if (currentHeight === lastHeight) {
      stableFrames++;
    } else {
      stableFrames = 0;
      lastHeight = currentHeight;
    }

    if (stableFrames < 3 && tries < 60) {
      tries++;
      rafId = requestAnimationFrame(restore);
      return;
    }

    const {
      lastOpenedResourceId,
      repositoryScrollY,
      setRepositoryScrollY,
      clearLastOpenedResourceId,
    } = useRepositoryStore.getState();

    const target = lastOpenedResourceId
      ? document.getElementById(`resource-${lastOpenedResourceId}`)
      : null;

    if (target) {
      target.scrollIntoView({
        block: "center",
        behavior: "instant",
      });
      clearLastOpenedResourceId();
    } else {
      window.scrollTo({
        top: repositoryScrollY,
        left: 0,
        behavior: "instant",
      });
    }

    setRepositoryScrollY(0);
    hasRestoredScrollRef.current = true;
  };

  rafId = requestAnimationFrame(restore);

  return () => cancelAnimationFrame(rafId);
}, [mediaList, navigationType, showBlockingLoader, scrollTick]);

  return (
    <div className="bg-[var(--listing-white)]  relative listing-pages overflow-x-hidden overflow-y-visible" style={{...theme.vars, overflowY: 'visible'}}>
      
      <div className="container max-w-[93.75rem] mx-auto">
        <div className="min-h-screen flex flex-col align-items-center gap-4">
             <div className="w-full">
            <Header />
          </div>
           <div className="">
          {/* <ExploreByTheme /> */}

          <main className="w-full mx-auto">
            {!!mediaList?.length && (

<>
  <BrowseResources
    resources={mediaList}
    viewMode="grid"
    compact={true}
    title="repository.library"
  />
  <BrowseResourcesGrid
    displayedResources={mediaList.slice(0, 6)}
    viewMode="grid"
    cardsSpacing={true}
    filtersInitialized={true}
  />
</>
            )}
         
           
            {!showBlockingLoader && !!!mediaList?.length && (
              <div className="w-full pt-10 mx-auto flex flex-col items-center justify-center">
                <div className="text-muted">
                  <GrResources size={100} />
                </div>
                <div className="flex flex-col items-center justify-center p-4">
                  <h2 className="text-lg py-2 text-center">{t("noResourceFoundTitle")}</h2>
                </div>
              </div>
            )}
          </main>
          </div>
        </div>
      </div>
      {showBlockingLoader && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-black bg-opacity-75 text-white h-screen">
          {t("common.loadingText")}
        </div>
      )}

      <MitraAiAssistantAside />

      <Footer />
    </div>
  );
}
