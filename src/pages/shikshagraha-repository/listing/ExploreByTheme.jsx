import React from "react";
import {
  BookOpen,
  Settings,
  Users,
  Layers,
  GraduationCap,
  Scale,
  Globe,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore";
import { useTranslation } from "react-i18next";

const themes = [
  {
    title: "Foundational Learning",
    count: 18,
    icon: BookOpen,
  },
  {
    title: "School Governance",
    count: 16,
    icon: Settings,
  },
  {
    title: "Community Engagement",
    count: 12,
    icon: Users,
  },
  {
    title: "System Thinking",
    count: 10,
    icon: Layers,
  },
  {
    title: "Teacher Training",
    count: 8,
    icon: GraduationCap,
  },
  {
    title: "Child Rights",
    count: 6,
    icon: Scale,
  },
  {
    title: "Network Health",
    count: 6,
    icon: Globe,
  },
  {
    title: "Inclusive Pedagogy",
    count: 5,
    icon: Heart,
  },
];

export default function ExploreByTheme() {
  const navigate = useNavigate();
    const { t } = useTranslation();
  const setFilters = useRepositoryStore((s) => s.setFilters);
  const fetchMediaList = useRepositoryStore((s) => s.fetchMediaList);
  const setApplyingUrlFilters = useRepositoryStore((s) => s.setApplyingUrlFilters);
  
  return (
    <section className="w-full mt-8 md:mt-10 px-4 md:px-12 mb-5">
      <h2 className="text-[1.25rem] md:text-[1.375rem] font-['Comfortaa'] font-semibold tracking-[0.0625rem] text-repository-heading capitalize mb-5">
        {t("repository.exploreByTheme")}
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {themes.map((theme) => {
          const Icon = theme.icon;

          return (
<div
  key={theme.title}
  onClick={async () => {
    // Apply the theme filter in-store first (skip immediate fetch), mark applying flag,
    // then navigate and trigger one immediate fetch so listing shows filtered data on first visit.
    try {
      setApplyingUrlFilters(true);
      setFilters({ tags: [{ value: theme.title, display: theme.title }] }, true, { skipFetch: true });
      navigate(`/resources?theme=${encodeURIComponent(theme.title)}`);
      await fetchMediaList({}, true);
    } finally {
      setApplyingUrlFilters(false);
    }
  }
  }
  className="
    bg-white
    border
    border-repository-border
    rounded-[0.75rem]
    h-[9.125rem]
    p-[0.875rem]
    pt-[0.625rem]
    flex
    flex-col
    items-center
    justify-center
    gap-[0.5rem]
    cursor-pointer
    transition-all
    duration-200
    hover:border-repository-borderHover
  "
>
<div
  className="
    w-[3.125rem]
    h-[3.125rem]
    rounded-[0.5rem]
    bg-repository-iconBg
    flex
    items-center
    justify-center
    mb-1
    shrink-0
  "
>
  <Icon
    size={24}
    strokeWidth={1.33}
    className="text-repository-iconColor"
  />
</div>

             <h3
  className="
    font-['Source_Sans_3']
    text-[1rem]
    font-bold
    leading-[0.9375rem]
    text-repository-title
    text-center
    w-full
    px-3
  "
>
                {theme.title}
              </h3>
<p
  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
  className="
    text-[0.875rem]
    font-medium
    leading-[1rem]
    text-repository-subtitle
    text-center
    mt-[-0.375rem]
  "
>
  {theme.count} items
</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}