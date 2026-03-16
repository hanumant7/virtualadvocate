import { useNavigate } from "react-router-dom";
import { useState } from "react";
import FloatingInput from "../components/FloatingInput";
import FloatingSelect from "../components/FloatingSelect";

import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../firebase";

export default function Signup() {

  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {

    setForm({ ...form, [e.target.name]: e.target.value });

  };

  const handleSignup = async () => {

    const { name, age, gender, phone, email, password, confirmPassword } = form;

    setError("");

    if (!name || !age || !gender || !phone || !email || !password || !confirmPassword) {

      setError("All fields are required.");
      return;

    }

    if (Number(age) < 18 || Number(age) > 100) {

      setError("Age must be between 18 and 100.");
      return;

    }

    if (!/^\d{10}$/.test(phone)) {

      setError("Phone number must be 10 digits.");
      return;

    }

    if (password.length < 6) {

      setError("Password must be at least 6 characters.");
      return;

    }

    if (password !== confirmPassword) {

      setError("Passwords do not match.");
      return;

    }

    try {

      setLoading(true);

      const userCred = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      await updateProfile(userCred.user, {
        displayName: name,
      });

      await setDoc(doc(db, "users", userCred.user.uid), {

        uid: userCred.user.uid,
        name,
        age: Number(age),
        gender,
        phone,
        email: email.trim().toLowerCase(),
        role: "User",
        provider: "manual",
        createdAt: serverTimestamp(),

      });

      navigate("/home");

    } catch (err) {

      setError(err.message.replace("Firebase:", "").trim());

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E8F1FF] via-[#D6E6FF] to-[#C7DBFF] px-4">

      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white/80 backdrop-blur-md border border-blue-100">

        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-[#1E3A8A]">
          Create Account
        </h2>

        <FloatingInput
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <FloatingInput
          label="Age"
          type="number"
          name="age"
          value={form.age}
          onChange={handleChange}
        />

        <FloatingSelect
          label="Gender"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          options={["Male", "Female", "Other"]}
        />

        <FloatingInput
          label="Phone Number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />

        <FloatingInput
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

        <FloatingInput
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <FloatingInput
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        {error && (
          <p className="text-red-600 text-sm mb-3">{error}</p>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-[#1E3A8A] text-white py-3 rounded-lg font-semibold hover:bg-[#1D4ED8] transition"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="text-center mt-4 text-sm text-[#1E3A8A]">

          Already have an account?{" "}

          <span
            onClick={() => navigate("/login")}
            className="underline cursor-pointer font-semibold"
          >
            Log In
          </span>

        </p>

      </div>

    </div>

  );

}
