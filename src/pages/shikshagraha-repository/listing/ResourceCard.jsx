import {
  File,
  Eye,
  Download,
} from "lucide-react"
import { trackResourceView } from "api/endpoints/analytics"
import { useTranslation } from "react-i18next"
import PdfIcon from "../../../assets/icons/pdf.svg"
import DocxIcon from "../../../assets/icons/docx.svg"
import XlsxIcon from "../../../assets/icons/xlsx.svg"
import GoogleDriveIcon from "../../../assets/icons/google_drive.svg"
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
        rounded-[16px]
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
          w-[96px]
          min-w-[96px]
          h-[68px]
          rounded-[8px]
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

        <span className="mt-1 text-[11px] font-semibold uppercase">
          {resource?.media_type_display}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3
          className="
            text-[20px]
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
            text-[14px]
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
          text-[12px]
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
            <span className="text-[14px]">
              {resource?.view_count ?? 0}k
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Download size={14} />
            <span className="text-[14px]">
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
              text-[14px]
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
      rounded-[12px]
      py-[27px]
      px-[19px]
      h-[284px]
      cursor-pointer
      transition-all
      hover:shadow-sm
      w-full
    "
  >
    {/* Content */}
    <div className="flex flex-col items-center gap-[14px] flex-1">
      {/* Top Section */}
      <div className="flex w-full gap-[12px] h-[80px]">
        {/* File Type Box */}
        <div
  className={`
    ${background}
    w-[93px]
    min-w-[93px]
    h-[80px]
    border
    border-repository-border
    rounded-[8px]
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

  <span className="mt-1 text-[11px] font-semibold uppercase">
    {resource?.media_type_display || t("repository.file")}
  </span>
</div>

        {/* Title */}
        <div className="flex-1 min-w-0 flex items-center h-[74px] py-[10px]">
          <h3
            className="
              text-[16px]
              leading-[18px]
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
          text-[14px]
          leading-[20px]
          text-repository-cardDescription
          line-clamp-3
        "
      >
        {resource?.description || t("repository.notAvailable")}
      </p>

      {/* Tags + Footer Section */}
      <div className="w-full flex flex-col gap-[5px] mt-auto">
        {/* Tags */}
        {resource?.tag_names?.length > 0 && (
  <div className="pb-[12px] border-b border-repository-subtitle">
    <div className="flex items-center gap-[4px] overflow-hidden">
  {resource.tag_names.slice(0, 2).map((tag, index) => (
    <span
      key={index}
      className={`
        ${tagBg}
        ${tagText}
        px-[10px]
        py-[2px]
        rounded-full
        text-[14px]
        leading-[20px]
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
        <div className="flex items-center justify-between min-h-[29px]">
          <div className="flex items-center gap-[17px] text-repository-subtitle">
            <div className="flex items-center gap-[6px]">
              <Eye size={16} strokeWidth={1.8} />

              <span
                className="
                  text-[20px]
                  leading-[24px]
                  font-['Source_Sans_3']
                "
              >
                {resource?.view_count ?? 0}k
              </span>
            </div>

            <div className="flex items-center gap-[6px]">
              <Download size={16} strokeWidth={1.8} />

              <span
                className="
                  text-[20px]
                  leading-[24px]
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
                text-[20px]
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
                  text-[18px]
                  text-repository-subtitle
                  font-['Source_Sans_3']
                  underline
                  truncate
                  max-w-[120px]
                  mr-3
                "
              >
                {resource.organization}
              </span>

             <img
  src={GoogleDriveIcon}
  alt={t("repository.googleDrive")}
  className="
    h-[20px]
    w-[20px]
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