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

    <div className="min-h-screen bg-gradient-to-br from-[#E8F1FF] via-[#D6E6FF] to-[#C7DBFF]">

      <Navbar />

      <div className="px-4 md:px-10 py-10">

        <div className="max-w-5xl mx-auto">

          <h1 className="text-3xl font-bold text-[#1E3A8A] mb-8">
            Your Chat History
          </h1>

          {loading ? (

            <p className="text-[#1E3A8A]">Loading conversations...</p>

          ) : conversations.length === 0 ? (

            <p className="text-[#1E3A8A]">No previous chats found.</p>

          ) : (

            <div className="grid gap-5">

              {conversations.map((c) => (

                <div
                  key={c.id}
                  className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl transition border border-blue-100"
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

                    <p className="font-semibold text-[#1E3A8A] text-lg">
                      {c.title || "Legal Consultation"}
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                      {c.lastUpdated?.seconds
                        ? new Date(
                            c.lastUpdated.seconds * 1000
                          ).toLocaleString()
                        : ""}
                    </p>

                  </div>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="mt-4 text-sm font-medium text-red-500 hover:text-red-700 transition"
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
