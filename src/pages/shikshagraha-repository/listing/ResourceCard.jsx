import React from "react"
import {
  FileSpreadsheet,
  FileText,
  FileType,
  File,
  Eye,
  Download,
} from "lucide-react"
import ROUTES from "../../../url"
import env from "../../../utils/env"
import { trackResourceView } from "api/endpoints/analytics"
import { useTranslation } from "react-i18next"

const MEDIA_FILE_TYPE = {
  PDF: "PDF",
  DOCX: "DOCX",
  XLSX: "XLSX",
}

export const getMediaFileTypeStyles = type => {
  switch (type) {
    case MEDIA_FILE_TYPE.PDF:
      return {
        background: "bg-[#FF1744]",
        Icon: FileType,
      }

    case MEDIA_FILE_TYPE.DOCX:
      return {
        background: "bg-[#0086F9]",
        Icon: FileText,
      }

    case MEDIA_FILE_TYPE.XLSX:
      return {
        background: "bg-[#0DB563]",
        Icon: FileSpreadsheet,
      }

    default:
      return {
        background: "bg-[#6B7280]",
        Icon: File,
      }
  }
}

export default function ResourceCard({ resource }) {
  const { t } = useTranslation()

  const { background, Icon: FileIcon } = getMediaFileTypeStyles(
    resource?.media_type_display
  )

  const handleCardClick = () => {
    trackResourceView(resource?.id)

    const root = (env.ROOT_PATH() || "").replace(/^\/|\/$/g, "")
    const repo = (
      ROUTES.SHIKSHAGRAHA_REPOSITORY || ""
    ).replace(/^\/|\/$/g, "")

    const id = resource?.id ? `/${resource.id}` : ""

    const pathParts = [root, repo].filter(Boolean).join("/")

    const finalUrl =
      `${window.location.origin}` +
      `${pathParts ? "/" + pathParts : ""}` +
      `${id}`

    window.open(finalUrl, "_blank")
  }

  return (
    <div
      role="button"
      onClick={handleCardClick}
      className="
  bg-white
  border
  border-[#E5E7EB]
  rounded-[16px]
  p-4
  cursor-pointer
  transition-all
  hover:shadow-sm
  w-full
"
    >
      {/* Top Section */}
      <div className="flex gap-3 items-center">
  {/* File Type Box */}
  <div
    className={`
      ${background}
      w-[82px]
      min-w-[82px]
      h-[72px]
      rounded-[8px]
      flex
      flex-col
      items-center
      justify-center
      text-white
    `}
  >
    <FileIcon className="w-[18px] h-[18px]" />

    <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2px]">
      {resource?.media_type_display || "FILE"}
    </span>
  </div>

  {/* Title */}
  <div className="flex-1 min-w-0 flex items-center h-[72px]">
    <h3
      className="
        text-[14px]
        leading-[18px]
        font-medium
        text-[#2D2D2D]
        line-clamp-3
      "
    >
      {resource?.title || t("repository.notAvailable")}
    </h3>
  </div>
</div>

      {/* Description */}
      <div className="mt-3">
        <p
          className="
            text-[12px]
            leading-[18px]
            text-[#6B7280]
            line-clamp-3
          "
        >
          {resource?.description || t("repository.notAvailable")}
        </p>
      </div>

      {/* Tags */}
      {resource?.tag_names?.length > 0 && (
        <div className="flex flex-wrap gap-[6px] mt-3">
          {resource.tag_names.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="
                px-[10px]
                py-[4px]
                rounded-full
                bg-[#FEE2E2]
                text-[#DC2626]
                text-[11px]
                font-medium
                whitespace-nowrap
              "
            >
              {tag}
            </span>
          ))}

          {resource?.tag_names?.length > 3 && (
            <span
              className="
                px-[10px]
                py-[4px]
                rounded-full
                bg-[#FEE2E2]
                text-[#DC2626]
                text-[11px]
                font-medium
              "
            >
              +{resource.tag_names.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[#DADADA] mt-4 mb-3" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5 text-[#8B8B8B]">
          <div className="flex items-center gap-1.5">
            <Eye size={14} strokeWidth={1.8} />
            <span className="text-[14px] leading-none">
              {resource?.view_count ?? 0}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Download size={14} strokeWidth={1.8} />
            <span className="text-[14px] leading-none">
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
            "
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()

              if (resource?.organization_url) {
                window.open(resource.organization_url, "_blank")
              }
            }}
          >
            <span
              className="
                text-[14px]
                text-[#7A7A7A]
                font-medium
                underline
                truncate
                max-w-[120px]
              "
            >
              {resource.organization}
            </span>

            {resource?.org_logo && (
              <img
                src={resource.org_logo}
                alt={resource.organization}
                className="
                  h-[20px]
                  w-[20px]
                  object-contain
                  flex-shrink-0
                "
              />
            )}
          </button>
        )}
      </div>
    </div>
  )
}