import React from "react";
import { useTranslation } from "react-i18next";

export default function WelcomeCard() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 sm:gap-5 lg:gap-[1.25rem] rounded-[1.25rem] p-4 sm:p-6 lg:p-[1.875rem] bg-white shadow-[0rem_0.125rem_0.25rem_0rem_#0000000D] mb-8 sm:mb-12 lg:mb-[1.25rem]">
      <h1 className="font-medium text-[1.5rem] leading-[2.25rem] text-center text-[#333333]">
        {t("defineChallenge.welcomeCardTitle")}
      </h1>
    </div>
  );
}
