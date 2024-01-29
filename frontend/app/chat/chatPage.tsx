"use client";
import React, { useState, ChangeEvent } from "react";
import { CiUser } from "react-icons/ci";
import {
  Card,
  Input,
  Button,
  Avatar,
  Spacer,
  Snippet,
  Listbox,
} from "@nextui-org/react";

import BackGroundCard from "../Components/Cards/BackgroundCard";
import {
  ChatContainer,
  Conversation,
  MessageList,
  Message,
  MessageInput,
  MainContainer,
} from "@chatscope/chat-ui-kit-react";
import { Main } from "next/document";
import { BsArrowUpSquareFill } from "react-icons/bs";

interface ChatMessage {
  type: "user" | "assistant";
  text: string;
}
const sampleChatHistory: ChatMessage[] = [
  { type: "user", text: "Hello, how are you?" },
  {
    type: "assistant",
    text: "I'm good, thank you! How can I assist you today?",
  },
  { type: "user", text: "Can you tell me more about React?" },
  {
    type: "assistant",
    text: "Sure! React is a JavaScript library for building user interfaces. It's component-based, which makes it efficient for developing complex applications.",
  },
  { type: "user", text: "That's great to know. Thanks!" },
  {
    type: "assistant",
    text: "You're welcome! Feel free to ask if you have more questions.",
  },
];

const ChatPage: React.FC = () => {
  const [userInput, setUserInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUserInput = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/frontend/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ req: userInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const responseData = await response.json();

      setChatHistory((prevChatHistory) => [
        ...prevChatHistory,
        { type: "user", text: userInput },
        { type: "assistant", text: responseData.reply },
      ]);

      setUserInput("");
    } catch (error) {
      console.error("Error fetching chat data:", error);
    }
    setIsLoading(false);
  };

  return (
    <BackGroundCard
      className="bg-gray-900/30"
      darkMode
      headChildren="Chat with LLM"
      bodyChildren={
        <div className="w-full text-primary-800 gap-2 p-1">
          <div style={{ overflowY: "auto" }} className=" p-2">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection:
                    message.type === "user" ? "row-reverse" : "row",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
                className=" border-blue-500/10 border-1 rounded-lg p-2"
              >
                <Avatar
                  className="m-0.5"
                  color="primary"
                  isBordered
                  src={message.type === "user" ? "/user.png" : "/assistant.png"}
                />
                <Spacer x={0.5} />
                {message.text}
              </div>
            ))}
            <Input
              fullWidth
              color="primary"
              size="lg"
              placeholder="Type your query..."
              value={userInput}
              onChange={handleUserInput}
              disabled={isLoading}
            />
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="m-2"
              variant="shadow"
              color="primary"
            >
              {isLoading ? "Loading..." : "Send"}
            </Button>
          </div>
        </div>
      }
      footerChildren={<div>API hosted on AWS</div>}
    />
  );
};

export default ChatPage;
