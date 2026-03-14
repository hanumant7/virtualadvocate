import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserCircle, LogOut, Menu } from "lucide-react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Profile from "./Profile";
import logo from "../assets/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState(null);

  const navClass = (path) =>
    location.pathname === path
      ? "font-semibold text-[#090979] underline underline-offset-4"
      : "hover:text-blue-600";

  // 🔐 Load user profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUserData({
            uid: user.uid,
            name: data.name || "User",
            email: user.email,
            phone: data.phone || "",
            age: data.age || "",
            gender: data.gender || "",
            role: data.role || "User",
            joinedDate: data.createdAt
              ? data.createdAt.toDate().toLocaleDateString()
              : "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <>
      <div className="bg-white px-4 md:px-8 py-4 flex justify-between items-center shadow relative">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10" />
          <div>
            <h1 className="text-lg font-bold text-[#090979]">
              Virtual Advocate
            </h1>
            <p className="text-xs text-gray-500">
              AI-powered legal guidance
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-[#090979] font-medium">

          <button
            onClick={() => navigate("/home")}
            className={navClass("/home")}
          >
            Home
          </button>

          <button
            onClick={() => navigate("/chatbot")}
            className={navClass("/chatbot")}
          >
            Gemini Chatbot
          </button>

          <button
            onClick={() => navigate("/history")}
            className={navClass("/history")}
          >
            Case History
          </button>

          <button
            onClick={() => navigate("/chat-history")}
            className={navClass("/chat-history")}
          >
            Chat History
          </button>

          <UserCircle
            size={30}
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setShowProfile(true)}
          />

          <LogOut
            size={24}
            className="cursor-pointer text-red-600 hover:text-red-800"
            onClick={handleLogout}
          />
        </div>

        {/* Mobile Menu Icon */}
        <Menu
          className="md:hidden cursor-pointer text-[#090979]"
          onClick={() => setMobileMenu(!mobileMenu)}
        />

        {/* Mobile Dropdown */}
        {mobileMenu && (
          <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg p-4 flex flex-col gap-3 md:hidden">

            <button onClick={() => navigate("/home")}>Home</button>
            <button onClick={() => navigate("/chatbot")}>Gemini Chatbot</button>
            <button onClick={() => navigate("/history")}>Case History</button>
            <button onClick={() => navigate("/chat-history")}>Chat History</button>
            <button onClick={() => setShowProfile(true)}>Profile</button>
            <button onClick={handleLogout} className="text-red-600">
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfile && userData && (
        <Profile user={userData} onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}
