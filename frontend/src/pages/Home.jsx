import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Profile from "../components/Profile";
import Navbar from "../components/Navbar";

import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Home() {

  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // AUTH + PROFILE LOAD
  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {

      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {

          const data = userSnap.data();

          setUser({
            uid: currentUser.uid,
            name: data.name || "User",
            email: currentUser.email,
            phone: data.phone || "",
            age: data.age || "",
            gender: data.gender || "",
            role: data.role || "User",
            joinedDate: data.createdAt
              ? data.createdAt.toDate().toLocaleDateString()
              : "",
          });

        } else {

          const newUser = {
            name: currentUser.displayName || "Google User",
            email: currentUser.email,
            phone: currentUser.phoneNumber || "",
            age: "",
            gender: "",
            role: "User",
            provider: "google",
            emailVerified: true,
            createdAt: serverTimestamp(),
          };

          await setDoc(userRef, newUser);

          setUser({
            uid: currentUser.uid,
            ...newUser,
            joinedDate: new Date().toLocaleDateString(),
          });

        }

      } catch (err) {

        console.error("Profile load failed:", err);

      } finally {

        setAuthLoading(false);

      }

    });

    return () => unsubscribe();

  }, [navigate]);

  // BOTPress ONLY on Home Page
  useEffect(() => {

    const injectBotpress = () => {

      if (window.botpressLoaded) return;

      const injectScript = document.createElement("script");
      injectScript.src = "https://cdn.botpress.cloud/webchat/v3.6/inject.js";
      injectScript.async = true;

      injectScript.onload = () => {

        const botScript = document.createElement("script");

        botScript.src =
          "https://files.bpcontent.cloud/2026/02/12/09/20260212093542-X7ROZT2H.js";

        botScript.defer = true;

        document.body.appendChild(botScript);

        window.botpressLoaded = true;

      };

      document.body.appendChild(injectScript);

    };

    injectBotpress();

    return () => {

      const elements = document.querySelectorAll(
        "#bp-web-widget-container, .bpFab, .bpWebchat, iframe[src*='botpress']"
      );

      elements.forEach((el) => {
        el.style.display = "none";
      });

    };

  }, []);

  // SAVE CASE
  const saveCaseHistory = async (data) => {

    const currentUser = auth.currentUser;

    if (!currentUser) return;

    try {

      await addDoc(collection(db, "cases"), {
        userId: currentUser.uid,
        issue: issueText,
        category: data.detected_category || "",
        confidence:
          data.confidence_level ||
          data.confidence_score ||
          data.confidence ||
          "Low",
        ipc_sections: data.ipc_sections || [],
        bns_sections: data.bns_sections || [],
        legal_guidance: data.legal_guidance || null,
        related_judgments: data.related_judgments || [],
        createdAt: serverTimestamp(),
      });

    } catch (err) {

      console.error("Failed to save case:", err);

    }

  };

  // CALL BACKEND
  const handleGetLegalAdvice = async () => {

    if (!issueText.trim()) {
      setError("Please describe your legal problem first.");
      return;
    }

    setLoading(true);
    setError("");

    try {

      const response = await fetch(
        "https://virtualadvocate-production.up.railway.app/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ issue: issueText }),
        }
      );

      const data = await response.json();

      await saveCaseHistory(data);

      navigate("/result", {
        state: {
          issue: issueText,
          ...data,
        },
      });

    } catch (err) {

      setError("Failed to fetch legal advice. Try again.");

    } finally {

      setLoading(false);

    }

  };

  if (authLoading) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F1FF] via-[#D6E6FF] to-[#C7DBFF]">
        Loading...
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#E8F1FF] via-[#D6E6FF] to-[#C7DBFF]">

      <Navbar onProfileClick={() => setShowProfile(true)} />

      {showProfile && (
        <Profile user={user} onClose={() => setShowProfile(false)} />
      )}

      <div className="flex flex-col items-center justify-center px-4 py-16">

        <div className="w-full max-w-2xl rounded-2xl p-8 shadow-lg bg-white/80 backdrop-blur-md border border-blue-100">

          <h2 className="text-xl font-semibold text-[#1E3A8A] mb-4">
            Describe Your Legal Problem
          </h2>

          <textarea
            rows="4"
            placeholder="Explain your legal issue in detail..."
            className="w-full p-4 rounded-lg resize-none outline-none border border-blue-200 focus:ring-2 focus:ring-blue-300 text-[#1E3A8A]"
            value={issueText}
            onChange={(e) => setIssueText(e.target.value)}
          />

          {error && (
            <p className="mt-2 text-red-600 text-sm font-medium">
              {error}
            </p>
          )}

          <button
            onClick={handleGetLegalAdvice}
            disabled={loading}
            className="mt-5 w-full py-3 bg-[#1E3A8A] text-white font-semibold rounded-lg hover:bg-[#1D4ED8] transition disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Get Legal Advice"}
          </button>

        </div>

        <p className="mt-8 text-center text-sm text-[#1E3A8A]/80 max-w-2xl">

          <span className="font-semibold">Disclaimer:</span>  
          This AI-generated information is for educational purposes only  
          and does not constitute professional legal advice.

        </p>

      </div>

    </div>

  );

}
