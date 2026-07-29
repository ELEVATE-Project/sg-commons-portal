import React from "react";
import ResourceCard from "./ResourceCard";
export default function BrowseResourcesGrid({
  viewMode,
  cardsSpacing = false,
  filtersInitialized,
  displayedResources,
}) {
  return (
    <div className="relative overflow-hidden mb-2">
      <div className="absolute inset-0 z-0 pointer-events-none" />
      <div className="relative z-10">
        <div className="flex gap-0 md:!gap-6 items-stretch justify-start md:justify-center">
          <div
            className={`grid w-full
              ${viewMode === "grid"
                ? "gap-9 md:gap-x-4 md:gap-y-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "gap-3 grid-cols-1"
              }
              ${cardsSpacing
                ? "px-2 sm:px-4 md:px-6 lg:px-16"
                : "px-2 sm:px-0"
              }`}
            aria-busy={!filtersInitialized}
          >
            {filtersInitialized ? (
              displayedResources.map((resource, index) => (
                <div
                  key={resource.id}
                  data-resource-card
                  data-resource-id={resource.id}
                >
                  <ResourceCard
                    resource={resource}
                    index={index}
                    viewMode={viewMode}
                  />
                </div>
              ))
            ) : (
              Array.from({
                length: viewMode === "grid" ? 6 : 3,
              }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="w-full h-40 bg-gray-200 rounded-lg animate-pulse"
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}