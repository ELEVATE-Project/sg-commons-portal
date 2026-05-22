import { buildWebSocketUrl } from 'utils/helpers';
import { clearMitraSessionStorage } from "utils/helpers"
import { CONVERSATION_USER_TYPES } from '../../../constants/mitra.constants';
import { getBotConfigForFlow } from '../../../utils/common_flow';
import { getNewSessionID } from '../../../../../api/endpoints';
import { getTranslatedIntroMessageApi } from '../../../../../api/endpoints/ai';
import { ToastContainer } from "react-toastify";
import { useAICreationSessionStore } from 'store';
import { useChatWebhook } from 'hooks/useChatWebhook';
import { useConfirmationPopup } from "../../../../../hooks/useConfirmationPopup"
import { useNavigate, useSearchParams } from 'react-router-dom';
import BotMessage from './components/chat-message/BotMessage';
import ChatBox from './components/ChatBox';
import ChatWindow from './components/ChatWindow';
import LoadingChat from './components/LoadingChat';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import env from "../../../../../utils/env";

const { USER } = CONVERSATION_USER_TYPES;

const CommonFlow = ({ flowType, handleScrollIntoView }) => {
  const textInputRef = useRef(null);
  const hasConnectedRef = useRef(false);
  const pendingMessageRef = useRef(null);
  const timeoutRef = useRef([]);

  const commonFlowChatHistory = useAICreationSessionStore(state => state.commonFlowChatHistory);
  const commonFlowIntroMessage = useAICreationSessionStore(state => state.commonFlowIntroMessage);
  const profileId = useAICreationSessionStore(state => state.profileId);

  const { getSession, getInitialSwitchChatHistory, getCommonFlowChatHistory, setCommonFlowChatHistory, setCommonFlowIntroMessage, setSession: setSessionStore } = useAICreationSessionStore.getState();

  const [textMessage, setTextMessage] = useState('');
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [isLoadingIntro, setIsLoadingIntro] = useState(true);
  const { commonsNetworkReconnectionPopup } = useConfirmationPopup()
  const navigate = useNavigate()

  const handleScrollIntoViewRef = useRef(handleScrollIntoView);
  

  useEffect(() => {
    handleScrollIntoViewRef.current = handleScrollIntoView;
  }, [handleScrollIntoView]);

  const [searchParams] = useSearchParams();
  const accessToken = sessionStorage.getItem('accToken');

  const storageFlow = getBotConfigForFlow(flowType).flow_name;
  const botRoute = getBotConfigForFlow(flowType).route;

  const generateNewSession = async () => {
    try {
      const newSession = await getNewSessionID();
      if (newSession) {
        setSessionStore(newSession);
      }
    } catch (e) {
      console.error("Failed to refresh session for LCF", e);
    } 
  }

  useEffect(() => {
    const fetchIntroMessage = async () => {
      try {
        setIsLoadingIntro(true);
        const response = await getTranslatedIntroMessageApi({
          language: 'en',
          company_bot__route: botRoute,
        });
        const message = response?.[0]?.alt_introductory_message;
        if(message) {
          generateNewSession();
        }
        setCommonFlowIntroMessage(message);
      } catch (error) {
        console.error('Error fetching intro message:', error);
      } finally {
        setIsLoadingIntro(false);
      }
    };

    if (commonFlowIntroMessage) {
      setIsLoadingIntro(false);
    } else {
      fetchIntroMessage();
    }
  }, [flowType]);

  const onFinalReconnectAttempt = useCallback(() => {
    function onYesButtonClick() {
      try {
        let chat_history = getCommonFlowChatHistory();
        if (Array.isArray(chat_history)) {
          chat_history = chat_history.filter((chat, index) => !(index == chat_history.length - 1 && chat.source === "user"))
        }
        setCommonFlowChatHistory(chat_history)
        window.location.reload();
      } catch (error) {
        console.error("Error cleaning chat history before reload:", error);
        window.location.reload();
      }
    }

    function onNoButtonClick() {
      clearMitraSessionStorage()
      navigate("/")
      window.location.reload();
    }

    commonsNetworkReconnectionPopup(onYesButtonClick, onNoButtonClick);
  }, []);

  const onWebSocketOpen = useCallback(() => {
    const currentSessionId = getSession();
    sendSocketMessage({
      type: 'authenticate',
      sessionid: currentSessionId,
      profileid: profileId,
      access_token: accessToken,
      route: 'en',
      bot_route: botRoute,
      flow_name: storageFlow,
    });

    const initial_switch_chat_history = getInitialSwitchChatHistory();
    const common_flow_chat_history = getCommonFlowChatHistory();

    if (!commonFlowIntroMessage && Array.isArray(initial_switch_chat_history) && initial_switch_chat_history.length && initial_switch_chat_history[initial_switch_chat_history.length - 1]?.source === USER && Array.isArray(common_flow_chat_history) && !common_flow_chat_history.length) {
      const timeout_obj = setTimeout(() => {
        sendSocketMessage({
          text: initial_switch_chat_history[initial_switch_chat_history.length - 1]?.msg,
          context: '',
        });
      }, 100);
      timeoutRef.current.push(timeout_obj);
    }

    if (!commonFlowIntroMessage && pendingMessageRef.current) {
      const timeout_obj = setTimeout(() => {
        sendSocketMessage({
          text: pendingMessageRef.current,
          context: '',
        });
        pendingMessageRef.current = null;
      }, 100);
      timeoutRef.current.push(timeout_obj);
    }

  }, [profileId, accessToken, botRoute, storageFlow, commonFlowIntroMessage]);

  const onWebSocketMessage = useCallback(
    (event) => {
      const data = JSON.parse(event.data);
      const message = data?.text;

      if (message?.source === 'bot') {
        const prevChatHistory = getCommonFlowChatHistory();
        const lastIndex = prevChatHistory.length - 1;
        const lastMessage = prevChatHistory[lastIndex];

        if (lastIndex >= 0 && lastMessage?.source === 'bot') {
          let updatedLastMessage = { ...lastMessage };

          if (message?.msg) {
            updatedLastMessage.msg = lastMessage.msg + message.msg;
          }

          if (Array.isArray(message?.extra_content?.sources) && message?.extra_content?.sources.length) {
            updatedLastMessage.sources = message.extra_content.sources;
          }

          if (message?.extra_content?.file_url) {
            updatedLastMessage.file_url = message.extra_content.file_url;
          }

          setCommonFlowChatHistory([...prevChatHistory.slice(0, lastIndex), updatedLastMessage]);
        } else {
          const updatedMessage = {
            msg: message?.msg || '',
            source: 'bot',
            updated_at: Date.now(),
          }
          if (Array.isArray(message?.extra_content?.sources) && message?.extra_content?.sources.length) {
            updatedMessage["sources"] = message?.extra_content?.sources;
          }
          if(message?.extra_content?.file_url) {
            updatedMessage["file_url"] = message?.extra_content?.file_url;
          }
          setCommonFlowChatHistory([...prevChatHistory, updatedMessage]);
        }

        if (message?.finish_reason === 'stop') {
          setIsWaitingForBot(false);
        }

        handleScrollIntoViewRef.current?.();
      }
    },
    []
  );

  const {
    sendMessage: sendSocketMessage,
    connect: connectToWebSocket,
    disconnect,
    isConnected
  } = useChatWebhook(
    buildWebSocketUrl({
      searchParams,
      storageFlow,
      selectedType: '',
    }),
    {
      onOpen: onWebSocketOpen,
      onMessage: onWebSocketMessage,
      onFinalReconnectAttempt,
      autoConnect: false,
      reconnect: true,
      reconnectAttempts: env.WEBSOCKET_RETRY_NUM(),
    }
  );

  useEffect(() => {
    return () => {
      if (hasConnectedRef.current) {
        disconnect();
        hasConnectedRef.current = false;
      }
      if (timeoutRef.current.length) {
        timeoutRef.current.forEach(clearTimeout);
        timeoutRef.current = [];
      }
    };
  }, []);

  useEffect(() => {
    if (!isConnected && !isLoadingIntro) {
      connectToWebSocket()
      hasConnectedRef.current = true;
    }
  }, [isConnected, isLoadingIntro])

  const handleSendMessage = (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!textMessage.trim()) return;

    const newMessage = {
      msg: textMessage,
      source: 'user',
      updated_at: Date.now(),
    };

    setCommonFlowChatHistory([...commonFlowChatHistory, newMessage]);
    setIsWaitingForBot(true);

    if (!hasConnectedRef.current) {
      pendingMessageRef.current = textMessage;
      hasConnectedRef.current = true;
      connectToWebSocket();
    } else {
      sendSocketMessage({
        text: textMessage,
        context: '',
      });
    }

    handleScrollIntoView?.();
    setTextMessage('');
  };


  return (
    <div className="flex flex-col h-auto">
      <ToastContainer />
      {isLoadingIntro ? (
        <LoadingChat />
      ) : (
        <>
          {commonFlowIntroMessage && (
            <BotMessage primaryMessage={commonFlowIntroMessage} showChatStyle />
          )}
          
            {commonFlowChatHistory.length > 0 && (
              <ChatWindow
                chatHistory={commonFlowChatHistory}
              />
            )}   
            


            <div className="mt-auto">
                <ChatBox
                  textInputRef={textInputRef}
                  textMessage={textMessage}
                  handleOnInputText={(e) => setTextMessage(e.target.value)}
                  setUseTextbox={() => {}}
                  handleSendMessage={handleSendMessage}
                  isReadOnly={false}
                  disabled={isWaitingForBot}
                  isCommonFlow={true}
                />
            </div>
         
        </>
      )}
    </div>
  );
};

export default CommonFlow;
