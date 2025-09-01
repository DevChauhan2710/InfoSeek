import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Paperclip, ArrowUp, Globe, Bot } from "lucide-react";
import logo from "../../public/logo.png";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism";

function Promt({ resetChat, setResetChat, selectedChatIndex }) {
  const [inputValue, setInputValue] = useState("");
  const [typeMessage, setTypeMessage] = useState("");
  const [promt, setPromt] = useState([]);
  const [loading, setLoading] = useState(false);
  const promtEndRef = useRef();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      const storedPromt = localStorage.getItem(`promtHistory_${user._id}`);
      if (storedPromt) {
        setPromt(JSON.parse(storedPromt));
      }
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      localStorage.setItem(`promtHistory_${user._id}`, JSON.stringify(promt));
    }
  }, [promt]);

  useEffect(() => {
    promtEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [promt, loading]);



  // reset when user clicks "New Chat"
  useEffect(() => {
    if (resetChat) {
      setPromt([]);
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        localStorage.removeItem(`promtHistory_${user._id}`);
      }
      setResetChat(false);
    }
  }, [resetChat]);


  // show only one chat when selected
  useEffect(() => {
    if (selectedChatIndex !== null) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        const storedPromt = localStorage.getItem(`promtHistory_${user._id}`);
        if (storedPromt) {
          const allChats = JSON.parse(storedPromt);
          // show only up to that index + assistant reply
          const selectedChat = allChats.slice(0, (selectedChatIndex + 1) * 2);
          setPromt(selectedChat);
        }
      }
    }
  }, [selectedChatIndex]);
  


  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setInputValue("");
    setTypeMessage(trimmed);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, please login again!");
        return;
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/infoseek/promt`,
        { content: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPromt((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      console.error("API Error:", error);
      setPromt((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        {
          role: "assistant",
          content: "❌ Something went wrong with the AI response.",
        },
      ]);
    } finally {
      setLoading(false);
      setTypeMessage(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col items-center flex-1 w-full px-4 pb-4">
      {/* Greeting Section → ALWAYS FIXED ON TOP */}
      <div className="mt-10 text-center">
        <div className="flex items-center justify-center gap-2">
          <img src={logo} alt="InfoSeek Logo" className="h-8" />
          <h1 className="text-3xl md:text-3xl font-semibold text-white mb-2">
            Hi, I'm InfoSeek.
          </h1>
        </div>
        <p className="text-gray-400 text-base mt-2">
          💬 How can I help you today?
        </p>
      </div>

      {/* Chat Messages → SCROLLABLE AREA */}
      <div className="w-full max-w-4xl flex-1 overflow-y-auto mt-6 mb-4 space-y-4 max-h-[50vh] px-1">
        {promt.map((msg, index) => (
          <div
            key={index}
            className={`w-full flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" ? (
              <div className="w-full bg-[#232323] text-white rounded-xl px-4 py-3 text-sm whitespace-pre-wrap">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={codeTheme}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg mt-2"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          className="bg-gray-800 px-1 py-0.5 rounded"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="w-[50%] bg-blue-700 text-white rounded-xl px-4 py-2 text-sm whitespace-pre-wrap">
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {/* While user typing & waiting response */}
        {loading && typeMessage && (
          <div className="whitespace-pre-wrap px-4 py-2 rounded-xl text-sm bg-blue-700 text-white w-[30%] self-end ml-auto break-words">
            {typeMessage}
          </div>
        )}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start w-full">
            <div className="bg-[#232323] text-white px-4 py-2 rounded-xl text-sm animate-pulse">
              🤖 Loading...
            </div>
          </div>
        )}

        <div ref={promtEndRef} />
      </div>

      {/* Input Box */}
      <div className="w-full max-w-4xl relative mt-auto">
        <div className="bg-[#2f2f2f] rounded-[2rem] px-4 md:px-6 py-6 md:py-8 shadow-md">
          <input
            type="text"
            placeholder="💬 Message InfoSeek"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent w-full text-white placeholder-gray-400 text-base md:text-lg outline-none"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
            <div className="flex gap-2 flex-wrap">
              <button className="flex items-center gap-2 border border-gray-500 text-white text-sm md:text-base px-3 py-1.5 rounded-full hover:bg-gray-600 transition">
                <Bot className="w-4 h-4" />
                InfoMind (R1)
              </button>
              <button className="flex items-center gap-2 border border-gray-500 text-white text-sm md:text-base px-3 py-1.5 rounded-full hover:bg-gray-600 transition">
                <Globe className="w-4 h-4" />
                Search
              </button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button className="text-gray-400 hover:text-white transition">
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                className="bg-gray-500 hover:bg-blue-600 p-2 rounded-full text-white transition"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Promt;
