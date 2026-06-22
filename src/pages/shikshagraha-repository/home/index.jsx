import React, { useEffect } from "react";
import Header from "../../../components/header/Header.jsx";
import BrowseResources from "../listing/BrowseResources.jsx";
import Footer from "../../../components/footer/Footer.jsx";
import MitraAiAssistantAside from "../listing/MitraAiAssistantAside.jsx";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore.js";
import { useSearchParams } from "react-router-dom";
import { GrResources } from "react-icons/gr";
import { useTranslation } from "react-i18next";
import { theme } from "../../../theme";
import ExploreByTheme from "../listing/ExploreByTheme";

export default function RepositoryPage() {
  const { loadingList, loadingDetail, loadingMaster } = useRepositoryStore();

  const { t } = useTranslation()
  const isLoading = loadingList || loadingDetail || loadingMaster;

  const mediaList = useRepositoryStore((state) => state.mediaList);
  const q = useRepositoryStore((state) => state.q);
  const fetchMediaList = useRepositoryStore(
  (state) => state.fetchMediaList
);
  const resetFilters = useRepositoryStore((state) => state.resetFilters);

  const [searchParams] = useSearchParams();

  // If Home loads with `org` or `theme` params (e.g., via Back navigation),
  // remove them and ensure repository store is cleared so Home shows unfiltered data.
  useEffect(() => {
    const org = searchParams.get("org");
    const theme = searchParams.get("theme");
    if (org || theme) {
      try {
        const next = new URLSearchParams(searchParams.toString());
        next.delete("org");
        next.delete("theme");
        // replace so we don't pollute history
        const setSP = useSearchParams()[1];
        setSP(next, { replace: true });
      } catch (e) {
        // ignore
      }

      try {
        const forceReset = useRepositoryStore.getState().forceResetFilters;
        if (forceReset) forceReset({ skipFetch: true });
        else resetFilters({ skipFetch: true });
        // fetch unfiltered list
        const fetchMediaList = useRepositoryStore.getState().fetchMediaList;
        if (fetchMediaList) fetchMediaList({}, true);
      } catch (e) {
        // ignore
      }
    }
  }, [searchParams]);

  useEffect(() => {
  fetchMediaList();
}, [fetchMediaList]);

  // If there are no org/theme params in URL, ensure repository filters are cleared
  useEffect(() => {
    const org = searchParams.get("org");
    const theme = searchParams.get("theme");
    if (!org && !theme) {
      resetFilters();
    }
  }, [searchParams, resetFilters]);


  useEffect(() => {
    if (!!mediaList?.length && q && !loadingList) {
      const browseSection = document.querySelector("[data-browse-resources]");
      if (browseSection) {
        browseSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [mediaList, q, loadingList]);

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

 <BrowseResources
                resources={mediaList}
  viewMode="grid"
  compact={true}
  title="repository.library"
              />
            )}
         
           
            {!isLoading && !!!mediaList?.length && (
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
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-black bg-opacity-75 text-white h-screen">
          {t("common.loadingText")}
        </div>
      )}

      <MitraAiAssistantAside />

      <Footer />
    </div>
  );
}
