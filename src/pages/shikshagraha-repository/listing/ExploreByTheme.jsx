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
  
  return (
    <section className="w-full mt-8 md:mt-10 px-4 md:px-12 mb-5">
      <h2 className="text-[20px] md:text-[22px] font-['Comfortaa'] font-semibold tracking-[1px] text-repository-heading capitalize mb-5">
        {t("repository.exploreByTheme")}
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {themes.map((theme) => {
          const Icon = theme.icon;

          return (
<div
  key={theme.title}
  onClick={() =>
    navigate(`/resources?theme=${encodeURIComponent(theme.title)}`)
  }
  className="
    bg-white
    border
    border-repository-border
    rounded-[12px]
    h-[146px]
    p-[14px]
    pt-[10px]
    flex
    flex-col
    items-center
    justify-center
    gap-[8px]
    cursor-pointer
    transition-all
    duration-200
    hover:border-repository-borderHover
  "
>
<div
  className="
    w-[50px]
    h-[50px]
    rounded-[8px]
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
    text-[16px]
    font-bold
    leading-[15px]
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
    text-[14px]
    font-medium
    leading-[16px]
    text-repository-subtitle
    text-center
    mt-[-6px]
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