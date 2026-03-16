import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Landing() {

  const navigate = useNavigate();

  return (

    <div className="min-h-screen flex flex-col px-6 pt-6 bg-gradient-to-br from-[#E8F1FF] via-[#D6E6FF] to-[#C7DBFF]">

      {/* Logo Section */}

      <div className="flex items-center gap-3">

        <img
          src={logo}
          alt="Virtual Advocate Logo"
          className="w-12 h-12 object-contain"
        />

        <div>
          <h1 className="text-lg font-bold text-[#1E3A8A]">
            Virtual Advocate
          </h1>

          <p className="text-sm text-[#1E3A8A]/80">
            AI-powered legal guidance for everyone
          </p>
        </div>

      </div>

      {/* Hero Section */}

      <div className="flex flex-1 items-center justify-center">

        <div className="text-center px-6 py-10 max-w-xl bg-white/60 backdrop-blur-md rounded-2xl shadow-xl">

          <h2 className="text-3xl md:text-5xl font-bold text-[#0F172A]">
            Your Virtual Legal Assistant
          </h2>

          <p className="mt-6 text-[#334155] text-base md:text-lg">
            Get reliable legal guidance powered by AI.  
            Understand your rights, explore legal options, and take the next step with confidence.
          </p>

          <button
            onClick={() => navigate("/signup")}
            className="mt-10 px-8 py-3 bg-[#1E3A8A] text-white font-semibold rounded-lg hover:bg-[#1D4ED8] transition transform hover:scale-105 duration-200 shadow-md"
          >
            Sign Up & Get Legal Advice
          </button>

        </div>

      </div>

    </div>

  );

}
