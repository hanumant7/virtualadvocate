import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col px-6 pt-6 bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#BFDBFE]">
      {/* Top Logo Section */}
      <div className="flex items-center gap-3">
        <img
          src={logo}

          alt="Virtual Advocate Logo"
          className="w-12 h-12 object-contain"
        />
        <div>
          <h1 className="text-lg font-bold text-[#FFF1D5]">
            Virtual Advocate
          </h1>
          <p className="text-sm text-[#FFF1D5]">
            AI-powered legal guidance for everyone
          </p>
        </div>
      </div>

      {/* Center Hero Section */}
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center px-4 max-w-xl">
          <h2 className="text-3xl md:text-5xl font-bold text-[#FFF1D5]">
            Your Virtual Legal Assistant
          </h2>

          <p className="mt-6 text-[#FFF1D5] text-base md:text-lg">
            Get legal guidance using AI in a simple and easy way.
          </p>

          <button
            onClick={() => navigate("/signup")}
            className="mt-10 px-8 py-3 bg-[#FED2E2] text-[#8F87F1] font-semibold rounded-lg hover:scale-105 transition transform duration-200"
          >
            Sign Up & Get Legal Advice
          </button>
        </div>
      </div>
    </div>
  );
}
