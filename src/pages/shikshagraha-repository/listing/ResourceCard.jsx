import {
  File,
  Eye,
  Download,
} from "lucide-react"
import { trackResourceView } from "api/endpoints/analytics"
import { useTranslation } from "react-i18next"
import PdfIcon from "assets/icons/pdf.svg"
import DocxIcon from "assets/icons/docx.svg"
import XlsxIcon from "assets/icons/xlsx.svg"
import GoogleDriveIcon from "assets/icons/google_drive.svg"
import { useNavigate } from "react-router-dom"
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore"
import { openSafeUrl } from "../../../utils/urlUtils"
import PptxIcon from "assets/icons/pptx.svg"
import OneDriveIcon from "assets/icons/one_drive.svg";
import AwsS3Icon from "assets/icons/aws.svg";
import LocalUploadIcon from "assets/icons/Shikshagraha.svg";

const MEDIA_FILE_TYPE = {
  PDF: "PDF",
  DOCX: "DOCX",
  XLSX: "XLSX",
  PPTX: "PPTX",
  CSV: "CSV"
}

export const getMediaFileTypeStyles = type => {
  switch (type?.toUpperCase()) {
    case MEDIA_FILE_TYPE.PDF:
      return {
        background: "bg-repository-pdfBg",
        icon: PdfIcon,
      }

    case MEDIA_FILE_TYPE.DOCX:
      return {
        background: "bg-repository-docxBg",
        icon: DocxIcon,
      }

    case MEDIA_FILE_TYPE.XLSX:
    case MEDIA_FILE_TYPE.CSV:
      return {
        background: "bg-repository-xlsxBg",
        icon: XlsxIcon,
      }

    case MEDIA_FILE_TYPE.PPTX:
      return {
        background: "bg-repository-pptxBg",
        icon: PptxIcon,
      }

    default:
      return {
        background: "bg-repository-defaultFileBg",
        Icon: File,
      }
  }
}

export const getTagStyles = type => {
  switch (type) {
    case MEDIA_FILE_TYPE.PDF:
      return {
        bg: "bg-repository-pdfTagBg",
text: "text-repository-pdfTagText",
      }

    case MEDIA_FILE_TYPE.DOCX:
      return {
        bg: "bg-repository-docxTagBg",
text: "text-repository-docxTagText",
      }

    case MEDIA_FILE_TYPE.XLSX:
    case MEDIA_FILE_TYPE.CSV:
      return {
        bg: "bg-repository-xlsxTagBg",
text: "text-repository-xlsxTagText",
      }

    case MEDIA_FILE_TYPE.PPTX:
      return {
        bg: "bg-repository-pptxTagBg",
        text: "text-repository-pptxTagText",
      }

    default:
      return {
        bg: "bg-repository-defaultTagBg",
        text: "text-repository-textSecondary",
      }
  }
}

export const getSourceProviderIcon = provider => {
  if (provider == null) {
    return LocalUploadIcon;
  }

  switch (provider) {
    case "GOOGLE_DRIVE":
      return GoogleDriveIcon;

    case "ONE_DRIVE":
      return OneDriveIcon;

    case "AWS_S3":
      return AwsS3Icon;

    case "LOCAL":
      return LocalUploadIcon;

    default:
      return null;
  }
};

export default function ResourceCard({ resource, viewMode = "grid" }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setRepositoryScrollY = useRepositoryStore((state) => state.setRepositoryScrollY)

  const { background,icon, Icon: FileIcon } = getMediaFileTypeStyles(
  resource?.media_type_display
)

const { bg: tagBg, text: tagText } = getTagStyles(
  resource?.media_type_display
)

const sourceProviderIcon = getSourceProviderIcon(
  resource?.source_provider
);

  const handleCardClick = () => {
    trackResourceView(resource?.id);
    setRepositoryScrollY(window.scrollY || 0);
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

    // Let the detail Back button return to this exact list entry and page.
    navigate(`/resources/${resource?.id}`, {
      state: { fromRepositoryList: true },
    });
  };

const handleCardKeyDown = (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleCardClick();
  }
};

  if (viewMode === "list") {
  return (
    <div
      role="button"
      tabIndex={0}
  onClick={handleCardClick}
  onKeyDown={handleCardKeyDown}
      className="
        w-full
        bg-white
        border
        border-repository-cardBorder
        rounded-[1rem]
        px-3
        py-3
        flex
        gap-4
        cursor-pointer
        hover:shadow-sm
        transition-all
      "
    >
      {/* File Type */}
<div>
        <div
        className={`
          ${background}
          w-[6rem]
          min-w-[6rem]
          h-[4.5rem]
          rounded-[0.5rem]
          flex
          flex-col
          items-center
          justify-center
          text-white
        `}
      >
        {icon ? (
          <img
            src={icon}
            alt={resource?.media_type_display}
            className="w-6 h-6"
          />
        ) : (
          <FileIcon className="w-6 h-6" />
        )}

        <span className="mt-1 text-[0.6875rem] font-semibold uppercase">
  {resource?.media_type_display || t("repository.file")}
</span>
      </div>

      {/* Mobile only */}
<div className="sm:hidden flex items-center justify-center gap-3 mt-2 text-repository-cardMeta">
  <div className="flex items-center gap-1">
    <Eye size={12} />
    <span className="text-[0.6875rem]">
      {resource?.view_count ?? 0}
    </span>
  </div>

  <div className="flex items-center gap-1">
    <Download size={12} />
    <span className="text-[0.6875rem]">
      {resource?.download_count ?? 0}
    </span>
  </div>
</div>
</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3
          className="
            text-[0.875rem]
            font-medium
            text-repository-cardTitle
            line-clamp-2
            sm:line-clamp-1
            break-words
          "
        >
          {resource?.title || t("repository.notAvailable")}
        </h3>

        {/* Description */}
        <p
          className="
            
            text-[0.750rem]
            text-repository-cardDescription
            line-clamp-2
            sm:line-clamp-1
          "
        >
          {resource?.description || t("repository.notAvailable")}
        </p>



        {/* Footer */}
        <div className="flex items-center justify-between mt-2 gap-4 min-w-0">
  {/* Left Side - Tags */}
  <div className="flex-1 min-w-0">
    {resource?.tag_names?.length > 0 && (
      <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
        {resource.tag_names.slice(0, 2).map((tag, index) => (
          <span
            key={index}
            className={`
              ${tagBg}
              ${tagText}
              text-[0.5625rem] sm:text-[0.625rem]
px-1.5 sm:px-2
              py-0.5
              rounded-full
              whitespace-nowrap
              ${
  index === resource.tag_names.slice(0, 2).length - 1
    ? "truncate min-w-0"
    : "flex-shrink-0"
}
            `}
          >
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
</div>
  {/* Right Side - Stats + Organization */}
<div
  className="
    flex
    items-center
    justify-end
    gap-2
    mt-2
    text-repository-cardMeta
  "
>
  {/* Left Side */}
  <div className="hidden sm:flex items-center gap-3 sm:gap-5">
    <div className="flex items-center gap-1">
      <Eye size={14} />
      <span className="text-[0.813rem]">
        {resource?.view_count ?? 0}
      </span>
    </div>

    <div className="flex items-center gap-1">
      <Download size={14} />
      <span className="text-[0.813rem]">
        {resource?.download_count ?? 0}
      </span>
    </div>
  </div>

  {/* Right Side */}
  {resource?.organization && resource?.organization_url && (
    <button
      type="button"
      className="
    flex
  items-center
  gap-1
  min-w-0
  w-fit
  sm:w-auto
  sm:ml-auto
  truncate
  "
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();

        if (resource?.organization_url) {
          openSafeUrl(resource.organization_url);
        }
      }}
    >
      <span
 className={`
  flex-1
  text-[0.813rem]
  ${resource?.organization_url ? "underline" : ""}
  break-words
  sm:flex-none
  sm:truncate
  sm:max-w-none
  sm:whitespace-nowrap
  mr-3
  capitalize
`}
title={resource.organization}
>
        {resource.organization}
      </span>

{sourceProviderIcon && (
  <img
    src={sourceProviderIcon}
    alt={resource?.source_provider || t("repository.organization")}
    className="w-5 h-5 object-contain flex-shrink-0"
  />
)}
    </button>
  )}
</div>
      </div>
    </div>
  )
}

  return (
    <div className="border-b border-gray-100 pb-2 rounded-[0.75rem]">
  <div
    role="button"
    tabIndex={0}
    onClick={handleCardClick}
  onKeyDown={handleCardKeyDown}
    className="
      flex
      flex-col
      bg-white
      border
      border-repository-border
      rounded-[0.75rem]
      py-[1.6875rem]
      px-[1.1875rem]
      h-[17.75rem]
      cursor-pointer
      transition-all
      hover:shadow-sm
      w-full
    "
  >
    {/* Content */}
    <div className="flex flex-col items-center gap-[0.875rem] flex-1">
      {/* Top Section */}
      <div className="flex w-full gap-[0.75rem] h-[5rem]">
        {/* File Type Box */}
        <div
  className={`
    ${background}
    w-[5.8125rem]
    min-w-[5.8125rem]
    h-[5rem]
    border
    border-repository-border
    rounded-[0.5rem]
    flex
    flex-col
    justify-center
    items-center
    text-white
  `}
>
  {icon ? (
    <img
      src={icon}
      alt={resource?.media_type_display}
      className="w-7 h-7"
    />
  ) : (
    <FileIcon className="w-7 h-7" />
  )}

  <span className="mt-1 text-[0.6875rem] font-semibold uppercase">
    {resource?.media_type_display || t("repository.file")}
  </span>
</div>

        {/* Title */}
        <div className="flex-1 min-w-0 flex items-center h-[4.625rem] py-[0.625rem]">
          <h3
            className="
              text-[1rem]
              leading-[1.125rem]
              font-comfortaa 
              font-semibold
              text-repository-title
              line-clamp-3
              break-words
            "
          >
            {resource?.title || t("repository.notAvailable")}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p
        className="
        font-sourceSans
          w-full
          text-[0.875rem]
          leading-[1.25rem]
          text-repository-cardDescription
          line-clamp-3
        "
      >
        {resource?.description || t("repository.notAvailable")}
      </p>

      {/* Tags + Footer Section */}
      <div className="w-full flex flex-col gap-[0.3125rem] mt-auto">
        {/* Tags */}
<div className="pb-[0.75rem] border-b border-repository-subtitle min-h-[2.25rem]">
  {resource?.tag_names?.length > 0 && (
    <div className="flex items-center gap-[0.25rem] overflow-hidden">
      {resource.tag_names.slice(0, 2).map((tag, index) => (
        <span
          key={index}
          className={`
            ${tagBg}
            ${tagText}
            px-[0.625rem]
            py-[0.125rem]
            rounded-full
            text-[0.875rem]
            leading-[1.25rem]
            font-sourceSans
            whitespace-nowrap
            ${index === 1 ? "max-w-full truncate" : "flex-shrink-0"}
          `}
        >
          {tag}
        </span>
      ))}
    </div>
  )}
</div>

        {/* Footer */}
        <div className="flex items-center justify-between min-h-[1.8125rem]">
          <div className="flex items-center gap-[1.0625rem] text-repository-subtitle">
            <div className="flex items-center gap-[0.375rem]">
              <Eye size={16} strokeWidth={1.8} />

              <span
                className="
                  text-[1.25rem]
                  leading-[1.5rem]
                  font-sourceSans
                "
              >
                {resource?.view_count ?? 0}
              </span>
            </div>

            <div className="flex items-center gap-[0.375rem]">
              <Download size={16} strokeWidth={1.8} />

              <span
                className="
                  text-[1.25rem]
                  leading-[1.5rem]
                  font-sourceSans
                "
              >
                {resource?.download_count ?? 0}
              </span>
            </div>
          </div>

          {resource?.organization && (
            <button
              type="button"
              className="
                flex
                items-center
                gap-2
                min-w-0
                text-[1.25rem]
              "
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()

                if (resource?.organization_url) {
                  openSafeUrl(resource.organization_url)
                }
              }}
            >
              <span
                className={`
                  text-[1.125rem]
                  text-repository-subtitle
                  font-sourceSans
                  ${resource?.organization_url ? "underline" : ""}
                  truncate
                  max-w-[8rem]
                  mr-3
                  capitalize
                `}
                title={resource.organization}
              >
                {resource.organization}
              </span>
{sourceProviderIcon && (
<img
  src={sourceProviderIcon}
  alt={resource?.source_provider || t("repository.organization")}
  className="
    h-[1.25rem]
    w-[1.25rem]
    object-contain
    flex-shrink-0
  "
/>
)}
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
  </div>
)
}
