"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { useLLMOutput } from "@llm-ui/react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  projectId: string;
}

export function ChatInterface({ projectId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation history
  const { data: conversationHistory } = api.project.getConversation.useQuery({
    projectId,
  });

  const generateMutation = api.project.generate.useMutation();

  useEffect(() => {
    if (conversationHistory && Array.isArray(conversationHistory)) {
      setMessages(conversationHistory);
    }
  }, [conversationHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsGenerating(true);

    try {
      const result = await generateMutation.mutateAsync({
        projectId,
        prompt: input.trim(),
        conversationHistory: messages,
      });

      if (result.generationResult.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: "Landing page has been generated successfully! Check the preview on the right.",
        };
        setMessages([...newMessages, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: "assistant",
          content: `Sorry, there was an error generating your landing page: ${result.generationResult.errors.join(", ")}`,
        };
        setMessages([...newMessages, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, there was an error processing your request. Please try again.",
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Simple message renderer for now
  const MessageRenderer = ({ content }: { content: string }) => {
    return <p className="text-sm whitespace-pre-wrap">{content}</p>;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Chat with AI</h2>
        <p className="text-sm text-slate-600">
          Describe what you want to change or improve about your landing page.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.989L3 20l1.011-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
            <h3 className="text-slate-900 font-medium mb-1">Start the conversation</h3>
            <p className="text-slate-600 text-sm">
              Describe your landing page requirements or ask for modifications.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-900"
                  }`}
              >
                <MessageRenderer content={message.content} />
              </div>
            </div>
          ))
        )}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-900 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
                <span className="text-sm text-slate-600">Generating...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="flex-shrink-0 p-4 border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to change..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
} 