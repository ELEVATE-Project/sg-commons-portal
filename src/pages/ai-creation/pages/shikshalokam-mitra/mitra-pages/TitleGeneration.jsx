import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
/* utils and api services */
import { clearMitraSessionStorage } from "utils/helpers";

import {
  createProject,
  getTitle,
  saveUserChatsInDB,
  updateChatSession,
  validateTitle,
} from "../../../../../api/endpoints/chat_flow";
/* components */
import BotMessage from "./components/chat-message/BotMessage";
import ErrorText from "./components/ErrorText";
import LoadingChat from "./components/LoadingChat";
import UserMessage from "./components/chat-message/UserMessage";
/* constants */
import { LOADER_KEYS } from "../../../constants/common";
import { CONVERSATION_USER_TYPES } from "../../../constants/mitra.constants";
import ROUTES from "../../../../../url";
/* styles */
import "../stylesheet/chatStyle.css";
import { useNavigate } from "react-router-dom";
import { useAICreationSessionStore } from "store";
import TextareaWithVoice from "../../../components/textarea-with-mic";

const { BOT, USER } = CONVERSATION_USER_TYPES;
function TitleGeneration({
  handleScrollIntoView,
  isTitleGenerationSection,
  handleLoaderState,
  getLoaderState,
}) {
  const { t } = useTranslation("ai_creation_translation");
  const navigate = useNavigate();

  const preferredLanguage = useAICreationSessionStore(state => state.preferredLanguage) || {};
  const profileId = useAICreationSessionStore(state => state.profileId);

  const {
    getProjectTitle, setProjectTitle: setProjectTitleStore,
    getUserProblemStatement, getSelectedObjective, getSelectedAction,
    getSystemError, getSession, getSelectedWeek,
    getSelectedObjectiveSource, getSelectedActionSource,
    setMedia: setMediaStore, setProjectId,
  } = useAICreationSessionStore.getState();

  const [inputText, setInputText] = useState(() => {
    let title = getProjectTitle() || "";
    return title;
  });

  const titleCharacterLimit = 100;

  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [shouldDisableButton, setShouldDisableButton] = useState(false);
  const [media, setMedia] = useState([]);
  const [isApiCalling, setIsApiCalling] = useState(false);
  const [isRecording, setIsRecording] = useState(false)

  const language = preferredLanguage?.value || "en";
  const [fetchError, setFetchError] = useState("");

  const [localErrorText, setLocalErrorText] = useState("");

  useEffect(() => {
    async function fetchTitle() {
      try {
        handleLoaderState(LOADER_KEYS.LOAD_TITLE_GENERATION, true);
        let title = getProjectTitle();
        if (!title) {
          const user_problem_statement = getUserProblemStatement();
          const user_objective = getSelectedObjective();
          const user_action_list = getSelectedAction();
          const profile_id = profileId;
          title = await getTitle(
            user_problem_statement,
            user_objective,
            user_action_list,
            language,
            profile_id
          );
          if (title) {
            setInputText(title);
            setProjectTitleStore(title)
            if (isTitleGenerationSection) handleScrollIntoView();
          } else {
            window.location.reload();
          }
        } else {
          if (isTitleGenerationSection) handleScrollIntoView();
        }
      } catch (error) {
        setFetchError(
          getSystemError() || t("common.pleaseTryAgainLater")
        );
        handleLoaderState(LOADER_KEYS.LOAD_TITLE_GENERATION, false);
        console.error(error);
      } finally {
        handleLoaderState(LOADER_KEYS.LOAD_TITLE_GENERATION, false);
      }
    }
    fetchTitle();
  }, []);

  function handleInputText(e) {

    const newText = e?.target?.value;


    // Skip validation while recording
    if (isRecording) {
      setInputText(newText);
      return;
    }

    const specialCharRegex = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~₹]/;
    if (specialCharRegex.test(newText)) {
      setShouldDisableButton(true);
      setLocalErrorText(t("titleGeneration.shouldNotContainNumbers"));
    } else if (newText.length > titleCharacterLimit) {
      setShouldDisableButton(true);
      setLocalErrorText(t("titleGeneration.shouldNotExceed100Characters"));
    } else if (newText === "" && !isRecording) {
      setShouldDisableButton(true);
      setLocalErrorText(t("titleGeneration.titleCannotBeEmpty"));
    } else {
      setShouldDisableButton(false);
    }

    setInputText(newText);
  }


  async function handleCreateImprovement() {
    if (
      inputText &&
      inputText !== "" &&
      inputText.length <= titleCharacterLimit &&
      !shouldDisableButton
    ) {
      // setIsLoading(true);
      setIsApiCalling(true);
      const user_problem_statement = getUserProblemStatement();
      const user_objective = getSelectedObjective();
      const user_action_list = getSelectedAction();
      const profile_id = profileId;
      const validate_response = await validateTitle(
        inputText,
        user_problem_statement,
        user_objective,
        user_action_list,
        language,
        profile_id
      );
      setIsApiCalling(false);
      if (validate_response?.result) {
      } else {
        setLocalErrorText(validate_response?.error_message);
        return;
      }
      setIsLocalLoading(true);
      setProjectTitleStore(inputText)

      const session = getSession() || null;
      const field_to_update = {
        title: inputText,
        session_status: "COMPLETED",
      };

      const botMessage = {
        message:
          t("titleGeneration.hereIsTheTitle") +
          " " +
          t("titleGeneration.youCanEditIt"),
        role: BOT,
      };
      await saveUserChatsInDB(botMessage?.message, session, botMessage?.role);
      await saveUserChatsInDB(inputText, session, USER);

      try {
        const response = await updateChatSession(session, field_to_update);
        if (response) {
          const user_problem_statement = getUserProblemStatement();
          const project_duration = getSelectedWeek();
          const user_objective = getSelectedObjective();
          const user_action_list = getSelectedAction()[0]?.actionSteps?.map(step => step?.step);
          const access_token = sessionStorage.getItem(import.meta.env.VITE_ACCESS_TOKEN_KEY)
          const objective_chunk = getSelectedObjectiveSource() || [];
          const action_chunk = getSelectedActionSource() || [];

          const chunks = {
            objective_chunk,
            action_chunk
          };

          const project_response = await createProject(
            access_token,
            user_problem_statement,
            user_action_list,
            project_duration,
            inputText,
            profile_id,
            session,
            user_objective,
            chunks
          );

          const {
            media = [],
            mitra_result = {},
            status = "",
          } = project_response || {};

          if (media?.length > 0) setMedia(media);

          const { project_id } =
            mitra_result || {};


          if (status?.toLowerCase() === "ok") {

            clearMitraSessionStorage();
            setMediaStore(media)

            if (project_id) {
              setProjectId(project_id);
            }
  

            navigate(ROUTES.IMPROVEMENT_PLAN)

          }
        }
      } catch (error) {
        console.error("Error: ", error);
        window.location.href = ROUTES.LOGIN;
      }
    }
  }

  if (getLoaderState(LOADER_KEYS.LOAD_TITLE_GENERATION)) {
    return <LoadingChat />;
  }

  return (
      <div>
        <BotMessage showChatStyle primaryMessage={t("titleGeneration.hereIsTheTitle")} secondaryMessage={t("titleGeneration.youCanEditIt")} />
        {(!fetchError || fetchError === "") && (
          <div className="secondpage-textbox-container w-[75%] ml-[46px]">
            <TextareaWithVoice
              value={inputText}
              onChange={(val, isRec) => {
                if (isRec) {
                  setInputText(val) // Clear text when recording starts
                } else {
                  handleInputText({ target: { value: val } })
                }
              }}
              placeholder={t("titleGeneration.aiGeneratedTitle")}
              disabled={isApiCalling || isLocalLoading || media?.length > 0}
              className="secondpage-text-input"
              setIsRecording={setIsRecording}
            />
          </div>
        )}
        {fetchError && fetchError !== "" && <ErrorText errorText={fetchError} />}
        {localErrorText && localErrorText !== "" && <ErrorText errorText={localErrorText} />}

        {!isApiCalling && !isLocalLoading && media?.length === 0 && (
          <div className="fourthpage-next-div">
            <button className={`${shouldDisableButton ? "fifthpage-disable-button" : "fifthpage-select-bttn"} `} onClick={handleCreateImprovement}>
              {t("titleGeneration.createMicroImprovementPlan")}
            </button>
          </div>
        )}
        {(isApiCalling || isLocalLoading) && (
          <>
            <UserMessage showChatStyle message={t("titleGeneration.createMicroImprovementPlan")} />
            <LoadingChat />
          </>
        )}
      </div>
  )
}

export default TitleGeneration;
