import { useEffect, useRef, useState } from "react";
import { auth, db } from "./firebase";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

export default function ChatRoom({ channelId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!channelId) return;
    const q = query(
      collection(db, "channels", channelId, "messages"),
      orderBy("createdAt", "asc"),
      limit(500)
    );
    const off = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      // scroll to bottom on every update
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
    });
    return () => off();
  }, [channelId]);

  const send = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !text.trim()) return;
    await addDoc(collection(db, "channels", channelId, "messages"), {
      text: text.trim(),
      uid: user.uid,
      displayName: user.displayName || user.email,
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-950">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="flex flex-col">
            <div className="text-xs text-gray-400">{m.displayName}</div>
            <div className="bg-gray-900 inline-block px-3 py-2 rounded-xl">
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="p-3 border-t border-gray-800 flex gap-2">
        <input
          className="flex-1 rounded-xl bg-gray-900 px-3 py-2 outline-none text-white"
          placeholder={`Message #${channelId?.slice(0, 6) || ""}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-500">
          Send
        </button>
      </form>
    </div>
  );
}
