import React from "react";
import { useTranslation } from "react-i18next";
import ChatBox from "./ChatBox";

export default function InitialConversationCard({
  textInputRef,
  textMessage,
  handleOnInputText,
  setUseTextbox,
  handleSendMessage,
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-[1.25rem] rounded-[1.25rem] p-[0.625rem] md:p-[1.875rem] bg-transparent shadow-[0rem_0.125rem_0.25rem_0rem_#0000000D]">
      <p className="font-medium text-base leading-[1.5rem] text-center text-[#333333]">
        {t("defineChallenge.welcomeMessage")}
      </p>
      <ChatBox
        textInputRef={textInputRef}
        textMessage={textMessage}
        handleOnInputText={handleOnInputText}
        setUseTextbox={setUseTextbox}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
}
