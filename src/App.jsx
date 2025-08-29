import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Login from "./Login";
import Sidebar from "./Sidebar";
import ChatRoom from "./ChatRoom";

export default function App() {
  const [user, setUser] = useState(null);
  const [channelId, setChannelId] = useState(null);

  useEffect(() =>
    onAuthStateChanged(auth, (u) => setUser(u)), []);

  if (!user) return <Login />;

  return (
    <div className="min-h-screen flex bg-gray-950 text-white">
      <Sidebar selected={channelId} setSelected={setChannelId} />
      <div className="flex-1 flex flex-col">
        <header className="h-14 px-4 flex items-center justify-between border-b border-gray-800 bg-gray-950">
          <div className="font-semibold">Talk of the Past</div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-400">
              {user.displayName || user.email}
            </div>
            <button
              onClick={() => signOut(auth)}
              className="text-sm rounded px-3 py-1 bg-gray-900 hover:bg-gray-800"
            >
              Sign out
            </button>
          </div>
        </header>
        {channelId ? (
          <ChatRoom channelId={channelId} />
        ) : (
          <div className="flex-1 grid place-items-center text-gray-500">
            Choose or add a channel
          </div>
        )}
      </div>
    </div>
  );
}
