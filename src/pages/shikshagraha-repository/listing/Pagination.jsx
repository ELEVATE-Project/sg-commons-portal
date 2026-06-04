import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactPaginateModule from "react-paginate";
const ReactPaginate = ReactPaginateModule.default || ReactPaginateModule;
import { useMediaQuery } from "react-responsive";
import { useTranslation } from "react-i18next";

function Pagination({
  resourcesPerPage,
  totalResources,
  paginate,
  selectedPage,
}) {
  const { t } = useTranslation();
  const pageCount = Math.ceil(totalResources / resourcesPerPage);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  // const handlePageClick = (e) => {
  //   const selectedPage = e.selected;
  //   paginate(selectedPage);
  // };
   const handlePageClick = (e) => {
    const selectedPage = e.selected;
    paginate(selectedPage);
    const browseSection = document.querySelector('[data-browse-resources]');
    if (browseSection) {
      browseSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const defined_dimension_class = isMobile ? "w-[34px] h-[34px]" : "w-[54px] h-[54px]"
  const label_class = "flex flex-col items-center justify-center border p-1 rounded bg-white text-sm  " + defined_dimension_class  
  return (
    <div className="flex justify-center">
      <ReactPaginate
        forcePage={selectedPage}
        previousLabel={
          <div className={label_class}>
            <ChevronLeft className="icon" aria-label={t("common.previous")} />
          </div>
        }
        nextLabel={
          <div className={label_class}>
            <ChevronRight className="icon" aria-label={t("common.next")} />
          </div>
        }
        breakLabel={
          <div className={label_class}>
            <span className="text-xl">...</span>
          </div>
        }
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={isMobile ? 1 : 5}
        onPageChange={handlePageClick}
        containerClassName="flex items-center gap-2"
        previousLinkClassName="text-zinc-500"
        nextLinkClassName="text-zinc-500"
        activeLinkClassName={defined_dimension_class + " bg-[var(--listing-secondary)] text-white p-1 border-0 rounded flex items-center justify-center"}
        activeClassName={defined_dimension_class + " bg-[var(--listing-secondary)] text-white p-1 border-0 rounded flex items-center justify-center"}
        pageLinkClassName={defined_dimension_class + " flex items-center justify-center border rounded border-[var(--listing-border)] text-[var(--listing-strong-text)]"}
      />
    </div>
  );
}

export default Pagination;
