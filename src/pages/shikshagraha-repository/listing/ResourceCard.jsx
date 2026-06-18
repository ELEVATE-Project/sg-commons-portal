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
import { openSafeUrl } from "../../../utils/urlUtils"

const MEDIA_FILE_TYPE = {
  PDF: "PDF",
  DOCX: "DOCX",
  XLSX: "XLSX",
}

export const getMediaFileTypeStyles = type => {
  switch (type) {
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
      return {
        background: "bg-repository-xlsxBg",
        icon: XlsxIcon,
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
      return {
        bg: "bg-repository-xlsxTagBg",
text: "text-repository-xlsxTagText",
      }

    default:
      return {
        bg: "bg-repository-defaultTagBg",
        text: "text-repository-textSecondary",
      }
  }
}

export default function ResourceCard({ resource, viewMode = "grid" }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { background,icon, Icon: FileIcon } = getMediaFileTypeStyles(
  resource?.media_type_display
)

const { bg: tagBg, text: tagText } = getTagStyles(
  resource?.media_type_display
)

const handleCardClick = () => {
  trackResourceView(resource?.id);

  navigate(`/resources/${resource?.id}`);
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
        items-center
        gap-4
        cursor-pointer
        hover:shadow-sm
        transition-all
      "
    >
      {/* File Type */}
      <div
        className={`
          ${background}
          w-[6rem]
          min-w-[6rem]
          h-[4.25rem]
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
          {resource?.media_type_display}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3
          className="
            text-[1.25rem]
            font-medium
            text-repository-cardTitle
            truncate
          "
        >
          {resource?.title || t("repository.notAvailable")}
        </h3>

        {/* Description */}
        <p
          className="
            mt-1
            text-[0.875rem]
            text-repository-cardDescription
            line-clamp-1
          "
        >
          {resource?.description || t("repository.notAvailable")}
        </p>

        {/* Tags */}
{resource?.tag_names?.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-2">
    {resource.tag_names.slice(0, 4).map((tag, index) => (
      <span
        key={index}
        className={`
          ${tagBg}
          ${tagText}
          text-[0.75rem]
          px-3
          py-1
          rounded-full
          whitespace-nowrap
        `}
      >
        {tag}
      </span>
    ))}
  </div>
)}

        {/* Footer */}
        <div className="flex items-center gap-5 mt-3 text-repository-cardMeta">
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span className="text-[0.875rem]">
              {resource?.view_count ?? 0}k
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Download size={14} />
            <span className="text-[0.875rem]">
              {resource?.download_count ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Organization */}
      {resource?.organization && (
        <button
          type="button"
          className="flex items-center gap-3 ml-4 flex-shrink-0"
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()

            if (resource?.organization_url) {
              openSafeUrl(resource.organization_url)
            }
          }}
        >
          <span
            className="
              text-[0.875rem]
              text-repository-cardMeta
              underline
              whitespace-nowrap
            "
          >
            {resource.organization}
          </span>

          <img
            src={GoogleDriveIcon}
            alt={t("repository.organization")}
            className="w-6 h-6 object-contain"
          />
        </button>
      )}
    </div>
  )
}

  return (
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
              font-['Comfortaa'] 
              font-semibold
              text-repository-title
              line-clamp-3
            "
          >
            {resource?.title || t("repository.notAvailable")}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p
        className="
        font-['Source_Sans_3']
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
        {resource?.tag_names?.length > 0 && (
  <div className="pb-[0.75rem] border-b border-repository-subtitle">
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
        font-['Source_Sans_3']
        whitespace-nowrap
        ${
          index === 1
            ? "max-w-full truncate"
            : "flex-shrink-0"
        }
      `}
    >
      {tag}
    </span>
  ))}
</div>
  </div>
)}

        {/* Footer */}
        <div className="flex items-center justify-between min-h-[1.8125rem]">
          <div className="flex items-center gap-[1.0625rem] text-repository-subtitle">
            <div className="flex items-center gap-[0.375rem]">
              <Eye size={16} strokeWidth={1.8} />

              <span
                className="
                  text-[1.25rem]
                  leading-[1.5rem]
                  font-['Source_Sans_3']
                "
              >
                {resource?.view_count ?? 0}k
              </span>
            </div>

            <div className="flex items-center gap-[0.375rem]">
              <Download size={16} strokeWidth={1.8} />

              <span
                className="
                  text-[1.25rem]
                  leading-[1.5rem]
                  font-['Source_Sans_3']
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
                className="
                  text-[1.125rem]
                  text-repository-subtitle
                  font-['Source_Sans_3']
                  underline
                  truncate
                  max-w-[7.5rem]
                  mr-3
                "
              >
                {resource.organization}
              </span>

             <img
  src={GoogleDriveIcon}
  alt={t("repository.googleDrive")}
  className="
    h-[1.25rem]
    w-[1.25rem]
    object-contain
    flex-shrink-0
  "
/>
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
)
}