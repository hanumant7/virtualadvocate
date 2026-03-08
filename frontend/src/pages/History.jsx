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

export default function History() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date_desc");

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const q = query(
          collection(db, "cases"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const history = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCases(history);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const sortedCases = [...cases].sort((a, b) => {
    const categoryA = a.category || a.detected_category || "";
    const categoryB = b.category || b.detected_category || "";

    switch (sortBy) {
      case "date_desc":
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      case "date_asc":
        return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      case "alpha_asc":
        return (a.issue || "").localeCompare(b.issue || "");
      case "alpha_desc":
        return (b.issue || "").localeCompare(a.issue || "");
      case "category_asc":
        return categoryA.localeCompare(categoryB);
      case "category_desc":
        return categoryB.localeCompare(categoryA);
      default:
        return 0;
    }
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this case permanently?")) return;

    try {
      await deleteDoc(doc(db, "cases", id));
      setCases((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8F87F1] to-[#C68EFD]">
      
      {/* ✅ Shared Navbar */}
      <Navbar />

      <div className="px-4 md:px-10 py-10">
        <div className="max-w-5xl mx-auto">

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-white">
              Your Case History
            </h1>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 rounded-lg bg-white text-[#090979] outline-none"
            >
              <option value="date_desc">Date (Newest First)</option>
              <option value="date_asc">Date (Oldest First)</option>
              <option value="alpha_asc">Alphabetical (A → Z)</option>
              <option value="alpha_desc">Alphabetical (Z → A)</option>
              <option value="category_asc">Category (A → Z)</option>
              <option value="category_desc">Category (Z → A)</option>
            </select>
          </div>

          {loading ? (
            <p className="text-white">Loading history...</p>
          ) : sortedCases.length === 0 ? (
            <p className="text-white">No previous cases found.</p>
          ) : (
            <div className="grid gap-4">
              {sortedCases.map((c) => {
                const category =
                  c.category || c.detected_category || "Uncategorized";

                const confidence =
                  c.confidence || c.confidence_level || "Low";

                return (
                  <div
                    key={c.id}
                    className="bg-white p-5 rounded-2xl shadow hover:shadow-xl transition"
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        navigate("/result", {
                          state: {
                            issue: c.issue,
                            ipc_sections: c.ipc_sections || [],
                            bns_sections: c.bns_sections || [],
                            confidence_level: confidence,
                            legal_guidance: c.legal_guidance || null,
                            related_judgments:
                              c.related_judgments || [],
                          },
                        })
                      }
                    >
                      <p className="font-semibold text-[#090979] text-lg">
                        {c.issue}
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        {category} • {confidence}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {c.createdAt?.seconds
                          ? new Date(
                              c.createdAt.seconds * 1000
                            ).toLocaleDateString()
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}