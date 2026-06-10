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
  return (
    <section className="w-full mt-8 md:mt-10 px-4 md:px-12">
      <h2 className="text-[20px] md:text-[22px] font-normal tracking-[1px] text-[#2F2F2F] uppercase mb-5">
        Explore By Theme
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {themes.map((theme) => {
          const Icon = theme.icon;

          return (
            <div
              key={theme.title}
              className="
                bg-white
                border
                border-[#E6E6E6]
                rounded-[14px]
                h-[128px]
                flex
                flex-col
                items-center
                justify-center
                cursor-pointer
                transition-all
                duration-200
                hover:border-[#D8D8D8]
                hover:bg-[#FCFCFC]
              "
            >
              <div
                className="
                  w-[44px]
                  h-[44px]
                  rounded-[8px]
                  bg-[#E8D8FF]
                  flex
                  items-center
                  justify-center
                  mb-3
                "
              >
                <Icon
                  size={18}
                  strokeWidth={1.75}
                  className="text-[#6D6475]"
                />
              </div>

              <h3
                className="
                  text-[14px]
                  font-semibold
                  text-[#202020]
                  text-center
                  leading-[18px]
                  px-2
                "
              >
                {theme.title}
              </h3>

              <p
                className="
                  text-[12px]
                  font-normal
                  text-[#8D8D8D]
                  mt-1
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