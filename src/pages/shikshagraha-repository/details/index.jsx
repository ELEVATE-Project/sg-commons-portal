// ResourceDetailPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Heart, Share2, Star, Eye, ChevronDown } from "lucide-react";
import left1 from "../../../assets/dandelion-left-1.png";
import left2 from "../../../assets/dandelion-left-2.png";
import right1 from "../../../assets/dandelion-right-1.png";
import right2 from "../../../assets/dandelion-right-2.png";
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
    setHasPageLoaded(false);
    fetchMediaDetail(params.id);
    setHasPageLoaded(true);
  }, [fetchMediaDetail, params.id]);

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
      containerRef.current?.scrollIntoView({ behavior: "smooth", y: -999 });
    }
  }, [resourceData]);

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 w-screen h-screen pointer-events-none z-0"
        style={{
          backgroundImage: `url(${left1}), url(${right1}), url(${left2}), url(${right2})`,
          backgroundPosition: "left 0px top 400px, right 0px top 500px, left 0px bottom 0px, right 0px bottom 0px",
          backgroundRepeat: "no-repeat",
          backgroundSize: "160px, 160px, 200px, 200px",
        }}
      />
      <div
        className="w-full py-8 relative repository-detail-page overflow-visible z-10 bg-white"
        ref={containerRef}
        style={{...theme.vars, backgroundImage: "none"}}
      >
<section className="relative z-10 min-h-screen max-w-[1280px] mx-auto px-8">        <ToastContainer />
        {isLoading && (
          <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-black bg-opacity-75 text-white h-screen">
            {t("common.loadingText")}
          </div>
        )}
        <BackButton title={resourceData?.title} />
        <div className="flex gap-8 mt-2">
          {/* <ResourceImages images={resourceData?.images} /> */}
          <ResourceMeta resource={resourceData} />
        </div>
        {/* <Tabs tab={tab} setTab={setTab} />
        <TabContent tab={tab} resource={resourceData} /> */}
        <AccordionOverview overview={resourceData?.key_values} />
        </section>
      </div>
      <Footer />
    </>
  );
}

// --- Components below --- //

function BackButton({ title }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 text-sm text-repository-textSecondary mb-6">
      <button onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
      </button>

      <span>{t("common.back")}</span>

      <span>/</span>

      <span className="text-repository-controlIcon">
        {title}
      </span>
    </div>
  );
}

export function ResourceImages({ images }) {
  return (
    <div className="flex flex-col items-center min-w-[260px] max-w-[320px]">
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

  return (
    <div className="w-full">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
        {/* Top Row */}
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[36px] font-semibold text-[#1F2937] leading-tight">
                {resource?.title}
              </h1>

              <span className="bg-[#6D28D9] text-white text-[11px] px-2 py-1 rounded font-semibold">
                {fileType}
              </span>

              <span className="border border-repository-controlBorder rounded-md px-3 py-1 text-sm">
                <span className="text-[#10B981] font-medium">
                  {t("repository.publishedOn")}
                </span>{" "}
                {new Date(resource?.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-[#111827]">
              <Eye size={22} />
              <span className="text-[28px] font-medium">
                {resource?.views || "0"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[#111827]">
              <Download size={22} />
              <span className="text-[28px] font-medium">
                {resource?.downloads || "0"}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mt-5 text-repository-textSecondary text-[18px] leading-8">
          {resource?.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-5">
         {resource?.tags?.map((tag, idx) => (
  <span
    key={tag.id || idx}
    className="bg-[#F3F4F6] text-repository-textSecondary text-sm px-3 py-1 rounded-full"
  >
    {tag?.name}
  </span>
))}
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-3">
            <button
  onClick={() => {
    const success = openSafeUrl(resource?.s3_url);

    if (!success) {
      toast.error("Invalid download URL");
    }
  }}
  className="bg-[#A020F0] hover:bg-[#8B14D6] text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
>
              <Download size={18} />
              {t("common.download")}
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast("Link copied");
              }}
              className="border border-repository-controlBorder px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <Share2 size={18} />
              {t("common.share")}
            </button>
          </div>

          <button onClick={() => navigate(`${ROUTES.SHIKSHAGRAHA_REPOSITORY_LIST}?org=${resource?.organization}`)} className="border border-[#C084FC] text-[#7C3AED] px-6 py-3 rounded-lg">
            {t("repository.viewAllResources")} ↗
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
    toast.error("Invalid download URL");
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
          className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white"
        >
          <button
            onClick={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
            className="w-full flex items-center justify-between px-6 py-5 text-left"
          >
            <span className="text-[#4338CA] text-lg font-medium">
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
  return (
    <div className="py-8">
      <h2 className="text-[1.5rem] font-semibold text-[var(--listing-secondary)] mb-6">
        User Feedback
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
                    fill={j < review.rating ? "#FFD700" : "none"}
                    stroke="#FFD700"
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
  return (
    <div className="py-8">
      {/* Implement related resources list */}
      <span>Related resources go here.</span>
    </div>
  );
}
