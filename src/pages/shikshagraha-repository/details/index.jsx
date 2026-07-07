// ResourceDetailPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Heart, Share2, Star, Eye, ChevronDown } from "lucide-react";
import left1 from "assets/dandelion-left-1.png";
import right2 from "assets/dandelion-right-2.png";
import ReviewForm from "./ReviewForm";
import { useNavigate, useParams } from "react-router-dom";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore";
import { toast, ToastContainer } from "react-toastify";
import Footer from "../../../components/footer/Footer";
import ROUTES from "../../../url";
import { trackResourceDownload } from "api/endpoints/analytics";
import { theme } from "../../../theme";
import { useTranslation } from "react-i18next";
import { openSafeUrl } from "../../../utils/urlUtils";
import { sanitizeHtml } from "../../../utils/htmlUtils";
import viewAllIcon from "assets/icons/viewAllIcon.svg";
import { getTagStyles } from "../listing/ResourceCard.jsx";


export default function ResourceDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const resourceData = useRepositoryStore((state) => state.selectedMedia);
  const fetchMediaDetail = useRepositoryStore(
    (state) => state.fetchMediaDetail
  );
  const [hasPageLoaded, setHasPageLoaded] = useState(false);
  const { loadingDetail } = useRepositoryStore();
  const isLoading = useRepositoryStore((state) => state.loadingDetail);
  const containerRef = useRef(null);
  useEffect(() => {
    let mounted = true;
    setHasPageLoaded(false);
    (async () => {
    await fetchMediaDetail(params.id);
      if (mounted) setHasPageLoaded(true);
    })();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  const [tab, setTab] = useState("Overview");

  // routes to not found if resource is not found
  useEffect(() => {
    if (!resourceData && !loadingDetail && hasPageLoaded) {
      navigate(ROUTES.NOT_FOUND);
    }

    return () => {};
  }, [resourceData, loadingDetail, hasPageLoaded]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [resourceData]);

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 w-screen h-screen pointer-events-none z-0"
        style={{
          backgroundImage: `url(${left1}), url(${right2})`,
          backgroundPosition: "left 4rem top 25rem, right 6rem top 31.25rem",
          backgroundRepeat: "no-repeat",
          backgroundSize: "10rem, 15rem",
        }}
      />
      <div
        className="w-full py-8 relative repository-detail-page overflow-visible z-10"
        ref={containerRef}
        style={{...theme.vars, backgroundImage: "none"}}
      >
<section className="relative z-10 min-h-screen max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <ToastContainer />
        {isLoading && (
          <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-black bg-opacity-75 text-white h-screen">
            {t("common.loadingText")}
          </div>
        )}
        <BackButton title={resourceData?.title} resource={resourceData} />
        <div className="px-2 sm:px-6 md:px-10">
        <div className="flex gap-8 mt-2">
          {/* <ResourceImages images={resourceData?.images} /> */}
          <ResourceMeta resource={resourceData} />
        </div>
        </div>
        {/* <Tabs tab={tab} setTab={setTab} />
        <TabContent tab={tab} resource={resourceData} /> */}
        <div className="mt-8  px-4 lg:px-14">
        <AccordionOverview overview={resourceData?.key_values} />
        </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

// --- Components below --- //

function BackButton({ title, resource }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const masterList = useRepositoryStore((state) => state.masterList);

  const resolvedOrgParam = (() => {
    const raw = resource?.organization;
    if (!raw) return null;

    try {
      const orgDropdown = masterList?.find(
        (d) => d.key === "organizations"
      );

      const match = orgDropdown?.options?.find(
        (o) =>
          String(o.value) === String(raw) ||
          String(o.display || "").toLowerCase() ===
            String(raw).toLowerCase()
      );

      const val = match ? match.value : raw;
      return encodeURIComponent(val);
    } catch {
      return encodeURIComponent(raw);
    }
  })();

  const handleBack = async () => {
    const ref = document.referrer;
    const histState =
      (window && window.history && window.history.state) || {};

    if (
      (ref && ref.includes(ROUTES.SHIKSHAGRAHA_REPOSITORY_LIST)) ||
      histState?.fromDetail ||
      histState?.fromResource
    ) {
      // If resource belongs to an organization, preserve that filter
      if (resolvedOrgParam) {
        const fromParam = resource?.id
          ? `&fromResource=${encodeURIComponent(resource.id)}`
          : "";

          sessionStorage.setItem(
            "sg:lastFromDetail",
            JSON.stringify({
              id: resource?.id,
              ts: Date.now(),
            })
          );

        navigate(
          {
            pathname: ROUTES.SHIKSHAGRAHA_REPOSITORY_LIST,
            search: `?org=${resolvedOrgParam}${fromParam}`,
          },
          {
            replace: true,
            state: {
              fromDetail: true,
              fromResource: resource?.id,
            },
          }
        );

        return;
      }

      // Default behaviour - clear transient filters
      try {
        const clearAtomic =
          useRepositoryStore.getState().clearTransientFiltersAtomic;

        if (clearAtomic) {
          await clearAtomic();
        }

        navigate(ROUTES.SHIKSHAGRAHA_REPOSITORY_LIST, {
          replace: true,
        });
      } catch (e) {
        // Fallback
        const store = useRepositoryStore.getState();

        if (store.forceResetFilters) {
          store.forceResetFilters({ skipFetch: true });
        } else {
          store.resetFilters({ skipFetch: true });
        }

        navigate(ROUTES.SHIKSHAGRAHA_REPOSITORY_LIST, {
          replace: true,
        });

        if (store.fetchMediaList) {
          store.fetchMediaList({}, true);
        }
      }

      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(ROUTES.SHIKSHAGRAHA_REPOSITORY_LIST);
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm text-repository-title mb-6 min-w-0">
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-2 cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>{t("common.back")}</span>
      </button>

      <span className="text-repository-controlIcon">/</span>

      <span className="text-repository-controlIcon flex-1 min-w-0 truncate">
        {title}
      </span>
    </div>
  );
}

export function ResourceImages({ images }) {
  return (
    <div className="flex flex-col items-center min-w-[16.25rem] max-w-[20rem]">
      <img
        src={images?.[0]}
        alt="Primary"
        className="mb-2 rounded-lg aspect-[5/4] object-cover w-full"
      />
      <div className="flex gap-2 w-full">
        {(images ?? []).slice(1, 5).map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`thumb-${i}`}
            className="rounded-md w-20 aspect-video object-cover"
          />
        ))}
      </div>
    </div>
  );
}

function ResourceMeta({ resource }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileType =
    resource?.media_type_display?.toUpperCase() || "DOCX";
  const { bg: tagBg, text: tagText } = getTagStyles(
  resource?.media_type_display
);
  const masterList = useRepositoryStore((state) => state.masterList);
  const fetchMasterList = useRepositoryStore((state) => state.fetchMasterList);
  const replaceRepositoryQueryState = useRepositoryStore((state) => state.replaceRepositoryQueryState);

  useEffect(() => {
    if (!masterList) fetchMasterList();
  }, [masterList, fetchMasterList]);

  const resolvedOrgParam = (() => {
    const raw = resource?.organization;
    if (!raw) return null;
    try {
      const orgDropdown = masterList?.find((d) => d.key === "organizations");
      const match = orgDropdown?.options?.find(
        (o) => String(o.value) === String(raw) || String((o.display || "")).toLowerCase() === String(raw).toLowerCase()
      );
      const val = match ? match.value : raw;
      return encodeURIComponent(val);
    } catch (e) {
      return encodeURIComponent(raw);
    }
  })();

  return (
    <div className="w-full">
      <div className="bg-white border border-repository-divider rounded-[0.563rem] p-6">
        {/* Top Row */}
        {/* Top Row */}
<div className="flex flex-col lg:flex-row lg:justify-between gap-4">
  {/* Left Section */}
 <div className="flex-1 min-w-0">
  <div className="flex flex-wrap items-center gap-6 min-w-0">
    <h1 className="font-comfortaa font-bold text-[1.45rem] leading-[1.688rem] tracking-[-0.03rem] text-repository-title min-w-0 flex-shrink">
      {resource?.title}
    </h1>

<span
  className={`
    ${tagBg}
    ${tagText}
    inline-flex
    items-center
    justify-center
    box-border
    px-[0.363rem]
    py-[0.121rem]
    min-w-[2.722rem]
    h-[1.363rem]
    border
    border-repository-badgeBorder
    rounded-[0.242rem]
    font-dm
    font-semibold
    text-[0.665rem]
    leading-[0.938rem]
    whitespace-nowrap
    flex-none
  `}
>
  {fileType}
</span>

    <span
      className="
        flex
        items-center
        px-[0.919rem]
        gap-[0.779rem]
        h-[1.839rem]
        border-[0.092rem]
        border-repository-badgeBorder
        rounded-[0.368rem]
        whitespace-nowrap
      "
    >
      <span className="flex items-center h-[1.313rem] font-sourceSans font-normal text-[0.919rem] leading-[1.313rem] text-repository-successDark">
        {t("repository.publishedOn")}:
      </span>

      {resource?.created_at &&
 !Number.isNaN(new Date(resource.created_at).getTime())
  ? new Date(resource.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
  : "-"}
    </span>
  </div>
</div>

  {/* Right Section */}
  <div className="flex items-center gap-2 lg:gap-0 shrink-0">
  <div className="flex items-center gap-2 text-repository-title">
    <Eye size={22} />

    <span
      className="flex items-center w-[2.313rem] h-[2.125rem] font-dm font-normal text-[1.45rem] leading-[2.125rem]"
    >
      {resource?.view_count || "0"}
    </span>
  </div>

  <div className="flex items-center gap-2 text-repository-title">
    <Download size={22} />

    <span
      className="flex items-center w-[2.313rem] h-[2.125rem] font-dm font-normal text-[1.45rem] leading-[2.125rem]"
    >
      {resource?.download_count || "0"}
    </span>
  </div>
</div>
</div>

        {/* Description */}
        <p className="font-sourceSans font-normal text-[1.088rem] leading-[1.563rem] text-repository-cardDescription flex items-center mt-2">
          {resource?.description}
        </p>

        {/* Tags */}
<div className="flex flex-wrap gap-2 mt-3">
  {resource?.tags?.map((tag, idx) => (
    <span
      key={tag.id || idx}
      className={`
  inline-flex
  items-center
  box-border
  px-[0.605rem]
  py-[0.121rem]
  ${tagBg}
  ${tagText}
  rounded-[604.753rem]
  font-manrope
  font-medium
  text-[0.847rem]
  leading-[1.125rem]
  whitespace-nowrap
`}
    >
      {tag?.name}
    </span>
  ))}
</div>

        {/* Buttons */}
        <div className="mt-5 flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-3">
<button
  onClick={async () => {
    try {
      if (resource?.id) {
        await trackResourceDownload(resource.id);
      }
    } catch (err) {
      console.error("Failed to track download", err);
    }

    const success = openSafeUrl(resource?.file);

    if (!success) {
      toast.error(t("repository.invalidDownloadURL"));
    }
  }}
  className="
    inline-flex
    items-center
    justify-center
    gap-[0.38rem]
    box-border
    w-[9.227rem]
    h-[2.802rem]
    pl-[0.95rem]
    pr-[1.138rem]
    py-[0.475rem]
    bg-repository-downloadBtnBg
    hover:bg-repository-downloadBtnHoverBg
    rounded-[0.38rem]
    text-white
    transition-colors
    flex-none
  "
>
  <Download className="w-[1.125rem] h-[1.125rem] shrink-0" />

  <span
    className="
      flex
      items-center
      justify-center
      w-[5.375rem]
      h-[1.563rem]
      font-dm
      font-medium
      text-[1.14rem]
      leading-[1.563rem]
      text-center
      text-white
    "
  >
    {t("common.download")}
  </span>
</button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast("Link copied");
              }}
              className="border border-repository-controlBorder px-4 py-2 rounded-[0.438rem] flex items-center gap-2 font-medium font-manrope text-[1.10rem] text-black"
            >
              <Share2 size={18} />
              {t("common.share")}
            </button>
          </div>

<button
  disabled={!resolvedOrgParam}
  onClick={() => {
    if (!resolvedOrgParam) return;

    const fromParam = resource?.id
      ? `&fromResource=${encodeURIComponent(resource.id)}`
      : "";
    const search = `?org=${resolvedOrgParam}${fromParam}`;
    const orgOption = {
      value: decodeURIComponent(resolvedOrgParam),
      display:
        resource?.organization_display ||
        resource?.organization_name ||
        resource?.organization,
    };

    replaceRepositoryQueryState(
      { filters: { organizations: [orgOption] }, repositoryScrollY: 0 },
      { skipFetch: true }
    );

    sessionStorage.setItem(
      "sg:lastFromDetail",
      JSON.stringify({ id: resource?.id, ts: Date.now() })
    );

    navigate(
      {
        pathname: ROUTES.SHIKSHAGRAHA_REPOSITORY_LIST,
        search,
      },
      { state: { fromDetail: true, fromResource: resource?.id } }
    );

    const st = Object.assign({}, window.history.state || {}, {
      fromDetail: true,
      fromResource: resource?.id,
      sgTransient: true,
    });

    window.history.replaceState(st, "", window.location.href);
  }}
  className={`
  inline-flex
  items-center
  justify-center
  box-border
  w-full
  sm:w-auto
  min-h-[3.254rem]
  px-[0.726rem]
  py-[0.5rem]
  gap-[0.25rem]
  bg-repository-surface
  border-[0.125rem]
  border-repository-iconBg
  rounded-[0.484rem]
  transition-colors
  ${!resolvedOrgParam ? "opacity-50 cursor-not-allowed" : ""}
`}
>
  <span className="inline-flex items-center flex-wrap sm:flex-nowrap gap-[0.5rem] w-full sm:w-auto">
  {resource?.org_logo && (
    <span
      className="
        inline-flex
        items-center
        justify-center
        box-border
        w-[6.307rem]
        max-w-full
        h-[1.802rem]
        p-[0.246rem]
        border
        border-repository-badgeBorder
        rounded-[0.41rem]
        overflow-hidden
        shrink-0
      "
    >
      <img
        src={resource.org_logo}
        alt={resource?.organization || "Organization"}
        className="max-w-full h-[1.311rem] object-contain"
      />
    </span>
  )}

  <span
    className="
      inline-flex
      items-center
      min-w-0
      sm:w-[8.625rem]
      font-dm
      font-normal
      text-[1.033rem]
      leading-[0.938rem]
      text-repository-viewAllText
      whitespace-nowrap
    "
  >
    {t("repository.viewAllResources")}
  </span>

  <img
    src={viewAllIcon}
    alt=""
    aria-hidden="true"
    className="w-[0.625rem] h-[0.625rem] shrink-0"
  />
</span>
</button>
        </div>
      </div>
    </div>
  );
}

function Actions({ downloadUrl, resourceId }) {
  const { t } = useTranslation();

  const handleDownload = () => {
  trackResourceDownload(resourceId);

  const success = openSafeUrl(downloadUrl);

  if (!success) {
    toast.error(t("repository.invalidDownloadURL"));
  }
};

  return (
    <div className="flex gap-2 mt-4">
      <button
        className="flex gap-1 items-center justify-center bg-[var(--listing-primary)] text-white px-6 py-2 rounded shadow font-medium hover:bg-[var(--listing-primary-hover)] transition-colors"
        onClick={handleDownload}
      >
        <Download size={16} /> {t("repository.downloadResource")}
      </button>
      {/* <button className="border p-2 rounded">
        <Heart />
      </button> */}
      <button
        className="border p-2 rounded"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          toast(t("repository.linkCopied"));
        }}
      >
        <Share2 />
      </button>
    </div>
  );
}

const TABS_LIST = ["Overview"]; //"Review", "Related"

function Tabs({ tab, setTab }) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-8 border-b pt-8 mb-2 sticky top-0 bg-white">
      {TABS_LIST.map((name) => (
          <button
          key={name}
          className={`px-2 py-2 outline-none border-b-2 transition ${
            tab === name
              ? "border-[var(--listing-primary)] text-[var(--listing-primary)] font-medium"
              : "border-transparent text-gray-600"
          }`}
          onClick={() => setTab(name)}
        >
          {name === "Overview" ? t("repository.overview") : name}
        </button>
      ))}
    </div>
  );
}

function TabContent({ tab, resource }) {
  if (tab === "Overview")
    return <OverviewContent overview={resource?.key_values} />;
  if (tab === "Review")
    return <ReviewsSection reviews={resource?.reviewsList} />;
  if (tab === "Related")
    return <RelatedResources related={resource?.related} />;
  return null;
}

function AccordionOverview({ overview }) {
  const [openIndex, setOpenIndex] = useState(0);

  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-6 space-y-2">
          {value.map((item, idx) => (
            <li
              key={idx}
             dangerouslySetInnerHTML={{
    __html: sanitizeHtml(item),
  }}
            />
          ))}
        </ul>
      );
    }

    return (
      <div
        dangerouslySetInnerHTML={{
    __html: sanitizeHtml(value),
  }}
      />
    );
  };

  return (
    <div className="mt-8 space-y-4">
      {overview?.map(({ key, value }, index) => (
        <div
          key={index}
          className="border border-repository-divider rounded-[0.438rem] overflow-hidden bg-white"
        >
          <button
            onClick={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
            className="w-full flex items-center justify-between px-6 py-3 text-left"
          >
            <span className="font-comfortaa font-medium text-[1rem] leading-[1.9375rem] capitalize text-repository-docxBg flex-1">
              {index + 1}. {key}
            </span>

            <ChevronDown
              size={20}
              className={`transition-transform ${
                openIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>

          {openIndex === index && (
            <div className="px-6 pb-6 text-repository-body leading-8">
              {renderValue(value)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function OverviewContent({ overview }) {
  const processValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc ml-6 mb-2 text-gray-800 text-base leading-relaxed">
          {value.map((item, index) => (
            <li
              className="text-gray-600  leading-relaxed mt-2 mb-2 font-sans"
              key={index}
             dangerouslySetInnerHTML={{
    __html: sanitizeHtml(item),
  }}
            />
          ))}
        </ul>
      );
    }

    if (typeof value === "string") {
      return (
        <div className="text-gray-600 text-[1rem] leading-relaxed mt-2 mb-2 font-sans">
          {value.split("\n").map((item, index) => (
            <div
              className="d-block"
              key={index}
             dangerouslySetInnerHTML={{
    __html: sanitizeHtml(item),
  }}
            />
          ))}
        </div>
      );
    }
    return value;
  };

  return (
    <div className="py-4">
      {/* Paste overview markdown/html as needed */}
      {overview?.map(({ key, value }, index) => (
        <div key={index} className="mb-6">
          <h2 className="capitalize text-2xl font-semibold text-[var(--listing-secondary)] mb-4">
            {index + 1}. {String(key).toLowerCase()}
          </h2>
          <div>{processValue(value)}</div>{" "}
        </div>
      ))}
    </div>
  );
}
function ReviewsSection({ reviews }) {
  const { t } = useTranslation();
  return (
    <div className="py-8">
      <h2 className="text-[1.5rem] font-semibold text-[var(--listing-secondary)] mb-6">
        {t('repository.userFeedback')}
      </h2>
      <div className="flex flex-col gap-6">
        {reviews?.map((review, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold">{review.name}</span>
                <span className="block text-gray-500 text-sm">
                  {review.org}
                </span>
              </div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    fill={j < review.rating ? "var(--tw-rating)" : "none"}
                    stroke="var(--tw-rating)"
                    size={22}
                  />
                ))}
              </div>
            </div>
            <div className="mt-3">{review.comment}</div>
          </div>
        ))}
      </div>
      <ReviewForm onSubmit={(review) => console.log(review)} />
    </div>
  );
}

function RelatedResources({ related }) {
  const { t } = useTranslation();
  return (
    <div className="py-8">
      {/* Implement related resources list */}
      <span>{t('repository.relatedResourcesPlaceholder')}</span>
    </div>
  );
}
