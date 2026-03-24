import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Landing() {

  const navigate = useNavigate();

  return (

    <div className="min-h-screen flex flex-col px-6 pt-6 bg-gradient-to-br from-[#E8F1FF] via-[#D6E6FF] to-[#C7DBFF]">

      {/* Top Logo */}

      <div className="flex items-center gap-3 max-w-6xl mx-auto w-full">

        <img
          src={logo}
          alt="Virtual Advocate Logo"
          className="w-12 h-12 object-contain"
        />

        <div>
          <h1 className="text-lg font-bold text-[#1E3A8A]">
            Virtual Advocate
          </h1>

          <p className="text-sm text-[#1E3A8A]/70">
            AI-powered legal guidance
          </p>
        </div>

      </div>


      {/* Hero Section */}

      <div className="flex flex-1 items-center justify-center">

        <div className="text-center px-10 py-12 max-w-xl bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100">

          <h2 className="text-3xl md:text-5xl font-bold text-[#0F172A] leading-tight">
            Your Virtual Legal Assistant
          </h2>

          <p className="mt-6 text-[#334155] text-base md:text-lg leading-relaxed">

            Get reliable legal guidance powered by AI.
            Understand your rights, explore legal options,
            and take the next step with confidence.

          </p>

          {/* Buttons */}

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">

            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-3 bg-[#1E3A8A] text-white font-semibold rounded-lg hover:bg-[#1D4ED8] transition transform hover:scale-105 duration-200 shadow-md"
            >
              Sign Up & Get Legal Advice
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 border border-[#1E3A8A] text-[#1E3A8A] font-semibold rounded-lg hover:bg-blue-50 transition"
            >
              Login
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}
