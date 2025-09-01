import React, { useEffect, useState } from "react";
import axios from "axios";
import { LogOut, X } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import profile from "../../public/user.png";

function Sidebar({ onClose, onNewChat, onSelectChat }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [, setAuthUser] = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`promtHistory_${user._id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // show only user messages as titles
        setChats(parsed.filter((msg) => msg.role === "user"));
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/user/logout`,
        { withCredentials: true }
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      alert(data.message);

      setAuthUser(null);
      navigate("/login");
    } catch (error) {
      alert(error?.response?.data?.errors || "Logout Failed");
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#232327]">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="text-xl font-bold text-white">InfoSeek</div>
        <button onClick={onClose}>
          <X className="w-6 h-6 text-gray-300" />
        </button>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <button
          onClick={onNewChat}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl mb-4"
        >
          + New Chat
        </button>

        {chats.length > 0 ? (
          chats.map((chat, idx) => (
            <div
              key={idx}
              className="cursor-pointer text-gray-300 hover:text-white truncate border border-gray-700 rounded-md px-2 py-1"
              onClick={() => onSelectChat(idx)}
            >
              {chat.content}
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-sm mt-20 text-center">
            No chat history yet
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src={profile} alt="profile" className="rounded-full w-8 h-8" />
            <span className="text-gray-300">
              {user ? user?.firstName : "My Profile"}
            </span>
          </div>

          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 duration-300 transition"
            >
              <LogOut />
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
