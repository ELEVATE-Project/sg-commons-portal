import React, { useEffect } from "react";
import Header from "../../../components/header/Header.jsx";
import BrowseResources from "../listing/BrowseResources.jsx";
import Footer from "../../../components/footer/Footer.jsx";
import MitraAiAssistantAside from "../listing/MitraAiAssistantAside.jsx";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore.js";
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

  useEffect(() => {
  fetchMediaList();
}, [fetchMediaList]);


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
      <div className="container max-w-[1500px] mx-auto">
        <div className="min-h-screen py-3 flex flex-col align-items-center gap-4">
          <div className="w-full">
            <Header />
          </div>
           <div className="">
          <ExploreByTheme />

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
