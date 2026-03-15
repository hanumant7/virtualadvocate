import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import Navbar from "../components/Navbar";

export default function ChatHistory() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const q = query(
          collection(db, "conversations"),
          where("userId", "==", user.uid),
          orderBy("lastUpdated", "desc")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setConversations(data);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this conversation permanently?")) return;

    try {
      await deleteDoc(doc(db, "conversations", id));
      setConversations((prev) =>
        prev.filter((c) => c.id !== id)
      );
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8F87F1] to-[#C68EFD]">

      <Navbar />

      <div className="px-4 md:px-10 py-10">
        <div className="max-w-5xl mx-auto">

          <h1 className="text-2xl font-bold text-white mb-6">
            Your Chat History
          </h1>

          {loading ? (
            <p className="text-white">Loading conversations...</p>
          ) : conversations.length === 0 ? (
            <p className="text-white">No previous chats found.</p>
          ) : (
            <div className="grid gap-4">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-5 rounded-2xl shadow hover:shadow-xl transition"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      navigate("/chatbot", {
                        state: {
                          conversationId: c.id,
                          model: c.model,
                        },
                      })
                    }
                  >
                    <p className="font-semibold text-[#090979] text-lg">
                      {c.title || "Legal Consultation"}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {c.lastUpdated?.seconds
                        ? new Date(
                            c.lastUpdated.seconds * 1000
                          ).toLocaleString()
                        : ""}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="mt-4 text-sm text-red-600 hover:underline"
                  >
                    Delete Permanently
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
