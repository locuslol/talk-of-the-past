import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

export default function Sidebar({ selected, setSelected }) {
  const [channels, setChannels] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const q = query(collection(db, "channels"), orderBy("createdAt", "asc"));
    const off = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setChannels(list);
      if (!selected && list.length) setSelected(list[0].id);
    });
    return () => off();
  }, [selected, setSelected]);

  const addChannel = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await addDoc(collection(db, "channels"), {
      name: newName.trim(),
      createdAt: serverTimestamp(),
    });
    setNewName("");
    setAdding(false);
  };

  return (
    <div className="h-full w-64 bg-gray-900 border-r border-gray-800 p-3 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Channels</div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="text-sm px-2 py-1 rounded bg-gray-800 hover:bg-gray-700"
        >
          {adding ? "Cancel" : "+ Add"}
        </button>
      </div>

      {adding && (
        <form onSubmit={addChannel} className="mb-3 flex gap-2">
          <input
            className="flex-1 rounded bg-gray-800 px-2 py-1 outline-none"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. general"
          />
          <button className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500">
            Save
          </button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto space-y-1">
        {channels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setSelected(ch.id)}
            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 ${
              selected === ch.id ? "bg-gray-800" : ""
            }`}
          >
            #{ch.name || ch.id.slice(0, 6)}
          </button>
        ))}
        {!channels.length && (
          <div className="text-sm text-gray-500">No channels yet.</div>
        )}
      </div>
    </div>
  );
}
