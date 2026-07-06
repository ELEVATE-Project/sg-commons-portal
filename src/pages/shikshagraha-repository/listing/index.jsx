import React, { useEffect, useState } from "react";
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
import { useSearchParams } from "react-router-dom";

export default function RepositoryPage() {
  const [viewMode, setViewMode] = useState("grid");
  const { loadingList, loadingDetail, loadingMaster } = useRepositoryStore();

  const { t } = useTranslation()
  const isLoading = loadingList || loadingDetail || loadingMaster;

  const mediaList = useRepositoryStore((state) => state.mediaList);
  const q = useRepositoryStore((state) => state.q);
  const searchInput = useRepositoryStore((state) => state.searchInput);
  const setSearch = useRepositoryStore((state) => state.setSearch);

  const mediaCount = useRepositoryStore((state) => state.mediaCount);
  const pagination = useRepositoryStore((state) => state.pagination);
  const setPagination = useRepositoryStore((state) => state.setPagination);
  const fetchMediaList = useRepositoryStore(
  (state) => state.fetchMediaList
);
  const itemsPerPage = pagination.limit;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchParams, setSearchParams] = useSearchParams();

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const urlQuery =
      searchParams.get("searchResourceText") ||
      searchParams.get("searchText") ||
      "";
    const trimmedUrlQuery = urlQuery.trim();
    const { q: currentSearch, searchInput: currentSearchInput } =
      useRepositoryStore.getState();

    if (trimmedUrlQuery) {
      if (
        currentSearch !== trimmedUrlQuery ||
        currentSearchInput !== trimmedUrlQuery
      ) {
        setSearch(trimmedUrlQuery);
      }

      if (searchParams.has("searchText")) {
        const next = new URLSearchParams(searchParams.toString());
        next.delete("searchText");
        next.set("searchResourceText", trimmedUrlQuery);
        setSearchParams(next, { replace: true });
      }
    } else if (currentSearch || currentSearchInput) {
      setSearch("");
    }
  }, [searchParams, setSearch, setSearchParams]);

  useEffect(() => {
    // Only fetch if media list is empty to avoid duplicate initial requests
    if (!mediaList || mediaList.length === 0) {
      fetchMediaList();
    }
  }, [fetchMediaList, mediaList]);


  useEffect(() => {
    if (!!mediaList?.length && q && !loadingList) {
      const browseSection = document.querySelector("[data-browse-resources]");
      if (browseSection) {
        browseSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [mediaList, q, loadingList]);

  return (
    <div
  className="bg-white relative listing-pages overflow-x-hidden overflow-y-visible"
  style={{
    ...theme.vars,
    overflowY: "visible",
    backgroundImage: `url(${left1}), url(${right2})`,
    backgroundPosition: isMobile
      ? "left -2rem top 12rem, right -2rem top 20rem"
      : "left 2.8rem top 18.5rem, right 1.7rem top 31.8rem",
    backgroundRepeat: "no-repeat",
    backgroundSize: isMobile
      ? "5rem, 6rem"
      : "8rem, 10rem",
    backgroundAttachment: "fixed",
  }}
>
      <div className="container max-w-[93.75rem] mx-auto">
        <div className="min-h-screen py-3 flex flex-col align-items-center gap-4">
        <div className="w-full sm:px-6 lg:px-0 lg:w-[96.3%] mx-auto">
                    <PageHeader showSearch />
                  </div>
           <div className="">

          {/* <div className="w-full mt-4 md:mt-6 z-50">
            <Filters />
          </div> */}

          <main className="w-full mx-auto">
            {!!mediaList?.length && (

 <BrowseResources
                resources={mediaList}
  viewMode={viewMode}
  compact={false}
  title="repository.browseResources"
  setViewMode={setViewMode}
  cardsSpacing={true}
              />
            )}
         
           
            {!isLoading && !mediaList?.length && (
              <div className="w-full pt-10 mx-auto flex flex-col items-center justify-center">
                <div className="text-muted">
                  <GrResources size={100} />
                </div>
                <div className="flex flex-col items-center justify-center p-4">
                  <h2 className="text-lg py-2 text-center">{t("noResourceFoundTitle")}</h2>
                </div>
              </div>
            )}
            <div className="w-full mt-6 mx-auto">
              <Pagination
                resourcesPerPage={itemsPerPage}
                totalResources={mediaCount}
                selectedPage={Math.floor(pagination.offset / itemsPerPage)}
                paginate={(page) => {
                  setPagination({
                    ...pagination,
                    offset: (itemsPerPage + (page - 1) * itemsPerPage) || 0,
                    limit: itemsPerPage,
                  });
                }}
              />
            </div>
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
