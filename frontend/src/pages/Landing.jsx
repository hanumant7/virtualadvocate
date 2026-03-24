import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col px-6 pt-6 bg-gradient-to-br from-[#E8F1FF] via-[#D6E6FF] to-[#C7DBFF]">

      {/* ================= NAVBAR / LOGO ================= */}
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


      {/* ================= HERO SECTION ================= */}
      <div className="flex flex-1 items-center justify-center">

        <div className="text-center px-6 sm:px-10 py-10 sm:py-12 max-w-xl glass-card">

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-bold text-[#0F172A] leading-tight">
            Your Virtual Legal Assistant
          </h2>

          {/* Description */}
          <p className="mt-6 text-[#334155] text-base md:text-lg leading-relaxed">
            Get reliable legal guidance powered by AI.
            Understand your rights, explore legal options,
            and take the next step with confidence.
          </p>

          {/* ================= BUTTONS ================= */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">

            <button
              onClick={() => navigate("/signup")}
              className="btn-primary shadow-md"
            >
              Sign Up & Get Legal Advice
            </button>

            <button
              onClick={() => navigate("/login")}
              className="btn-outline"
            >
              Login
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
