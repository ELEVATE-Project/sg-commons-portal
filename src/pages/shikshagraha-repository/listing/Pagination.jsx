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
  const isMobile = useMediaQuery({ query: "(max-width: 48rem)" });

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
    <div className="flex justify-center mb-10">
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
        containerClassName="flex items-center gap-4 text-sm font-medium"

pageClassName="group"

pageLinkClassName="
  flex
  items-center
  justify-center
  w-7
  h-7
  rounded-md
  text-repository-paginationText
  transition-colors
  group-hover:bg-gray-200
  group-hover:text-repository-paginationText
"

activeClassName=""

activeLinkClassName="
  flex
  items-center
  justify-center
  w-7
  h-7
  rounded-md
  !bg-repository-primary
  !text-white
  hover:!bg-repository-primary
  hover:!text-white
"
      />
    </div>
  );
}

export default Pagination;