import { useNavigate } from "react-router-dom";
import { useState } from "react";
import FloatingInput from "../components/FloatingInput";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, googleProvider, db } from "../firebase";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  // EMAIL LOGIN
  const handleLogin = async () => {

    setError("");
    setMessage("");
    setNeedsVerification(false);

    try {

      setLoading(true);

      const userCred = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      const user = userCred.user;

      if (!user.emailVerified) {

        setNeedsVerification(true);
        await signOut(auth);
        return;

      }

      await updateDoc(doc(db, "users", user.uid), {
        emailVerified: true,
      });

      navigate("/home");

    } catch {

      setError("Invalid email or password");

    } finally {

      setLoading(false);

    }

  };

  // RESEND VERIFICATION
  const resendVerification = async () => {

    try {

      const userCred = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      await sendEmailVerification(userCred.user);

      await signOut(auth);

      setMessage(
        "Verification email sent again. Please check your inbox."
      );

    } catch {

      setError("Unable to resend email. Check credentials.");

    }

  };

  // GOOGLE LOGIN
  const handleGoogleLogin = async () => {

    setError("");
    setMessage("");

    try {

      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const existingUser = await getDoc(userRef);

      if (!existingUser.exists()) {

        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email,
          role: "User",
          provider: "google",
          emailVerified: true,
          createdAt: serverTimestamp(),
        });

      }

      navigate("/home");

    } catch {

      setError("Google sign-in failed");

    }

  };

  // PASSWORD RESET
  const handlePasswordReset = async () => {

    setError("");
    setMessage("");

    if (!email) {

      setError("Please enter your email to reset password");
      return;

    }

    try {

      await sendPasswordResetEmail(
        auth,
        email.trim().toLowerCase()
      );

      setMessage("Password reset link sent to your email");

    } catch {

      setError(
        "Failed to send reset email. Check the email address."
      );

    }

  };

  return (

    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#E8F1FF] via-[#D6E6FF] to-[#C7DBFF] px-4">

      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white/80 backdrop-blur-md border border-blue-100">

        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-[#1E3A8A]">
          Login to Virtual Advocate
        </h2>

        <FloatingInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FloatingInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Forgot password */}

        <p
          onClick={handlePasswordReset}
          className="text-sm text-right text-[#1E3A8A] cursor-pointer mb-3 font-medium hover:underline"
        >
          Forgot password?
        </p>

        {error && (
          <p className="text-red-600 text-sm mb-3">{error}</p>
        )}

        {message && (
          <p className="text-green-700 text-sm mb-3">{message}</p>
        )}

        {needsVerification && (

          <div className="bg-yellow-100 text-yellow-900 p-3 rounded-lg mb-3 text-sm">

            Your email is not verified.

            <button
              onClick={resendVerification}
              className="block mt-2 underline font-semibold"
            >
              Resend Verification Email
            </button>

          </div>

        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#1E3A8A] text-white py-3 rounded-lg mb-3 hover:bg-[#1D4ED8] transition"
        >
          {loading ? "Logging In..." : "Login"}
        </button>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-[#1E3A8A] py-3 rounded-lg border border-blue-200 font-semibold hover:bg-blue-50 transition"
        >
          Continue with Google
        </button>

        <p className="text-center mt-4 text-sm text-[#1E3A8A]">

          Don’t have an account?{" "}

          <span
            onClick={() => navigate("/signup")}
            className="underline cursor-pointer font-semibold"
          >
            Sign Up
          </span>

        </p>

      </div>

    </div>

  );

}
