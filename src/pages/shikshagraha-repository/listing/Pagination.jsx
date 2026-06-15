import ReactPaginateModule from "react-paginate";
const ReactPaginate = ReactPaginateModule.default || ReactPaginateModule;
import { useMediaQuery } from "react-responsive";

function Pagination({
  resourcesPerPage,
  totalResources,
  paginate,
  selectedPage,
}) {
  const pageCount = Math.ceil(totalResources / resourcesPerPage);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const handlePageClick = (e) => {
    paginate(e.selected);

    const browseSection = document.querySelector(
      "[data-browse-resources]"
    );

    if (browseSection) {
      browseSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="flex justify-center mt-10">
      <ReactPaginate
        forcePage={selectedPage}
        pageCount={pageCount}
        onPageChange={handlePageClick}
        marginPagesDisplayed={1}
        pageRangeDisplayed={isMobile ? 3 : 5}
        breakLabel="..."
        previousLabel={null}
        nextLabel={null}
        renderOnZeroPageCount={null}
        containerClassName="flex items-center gap-6 text-sm font-medium"
        pageClassName=""
        pageLinkClassName="text-[#444] hover:text-[var(--listing-secondary)] transition-colors"
        breakClassName=""
        breakLinkClassName="text-[#444]"
        activeClassName=""
        activeLinkClassName="
          flex
          items-center
          justify-center
          w-7
          h-7
          rounded-md
          bg-[var(--listing-secondary)]
          !text-white
        "
      />
    </div>
  );
}

export default Pagination;