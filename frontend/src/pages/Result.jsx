import { FileText, BookOpen, ArrowRightCircle, Scale } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Profile from "../components/Profile";

export default function Result() {

  const location = useLocation();
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);

  const issue = location.state?.issue || "";
  const judgments = location.state?.related_judgments ?? [];

  const ipc_sections = location.state?.ipc_sections || [];
  const bns_sections = location.state?.bns_sections || [];

  const confidence =
    location.state?.confidence_level ||
    location.state?.confidence ||
    "Low";

  const legal_guidance = location.state?.legal_guidance || null;

  const showLegalSections =
    ipc_sections.length > 0 || bns_sections.length > 0;

  const getConfidenceColor = () => {

    if (confidence === "High") return "bg-green-100 text-green-700";
    if (confidence === "Medium") return "bg-yellow-100 text-yellow-700";

    return "bg-red-100 text-red-700";

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#E8F1FF] via-[#D6E6FF] to-[#C7DBFF]">

      <Navbar onProfileClick={() => setShowProfile(true)} />

      {showProfile && (
        <Profile onClose={() => setShowProfile(false)} />
      )}

      <div className="px-4 md:px-10 py-10">

        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}

          <div className="text-center">

            <h1 className="text-3xl md:text-4xl font-bold text-[#1E3A8A]">
              Legal Case Summary
            </h1>

            <p className="text-sm md:text-base text-[#1E3A8A]/80 mt-2">
              AI-powered analysis and guidance for your issue
            </p>

          </div>

          {/* Main Card */}

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 space-y-8 border border-blue-100">

            {/* Case Details */}

            <Section
              icon={<FileText size={20} />}
              title="Case Details"
            >

              <p className="text-gray-700">
                {issue || "No case details available."}
              </p>

            </Section>

            {/* Legal Sections */}

            {showLegalSections && (

              <Section
                icon={<BookOpen size={20} />}
                title="Relevant Legal Sections"
              >

                <div className="mb-3">

                  <span className="text-sm text-gray-600 mr-2">
                    Confidence Level:
                  </span>

                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${getConfidenceColor()}`}
                  >
                    {confidence}
                  </span>

                </div>

                {ipc_sections.length > 0 && (

                  <div className="mb-4">

                    <h3 className="font-semibold text-gray-800 mb-1">
                      IPC Sections
                    </h3>

                    <ul className="list-disc ml-6 text-gray-700 space-y-1">

                      {ipc_sections.map((sec, index) => (

                        <li key={index}>
                          <strong>{sec.section}</strong> – {sec.title}
                        </li>

                      ))}

                    </ul>

                  </div>

                )}

                {bns_sections.length > 0 && (

                  <div>

                    <h3 className="font-semibold text-gray-800 mb-1">
                      BNS Sections
                    </h3>

                    <ul className="list-disc ml-6 text-gray-700 space-y-1">

                      {bns_sections.map((sec, index) => (

                        <li key={index}>
                          <strong>{sec.section}</strong> – {sec.title}
                        </li>

                      ))}

                    </ul>

                  </div>

                )}

                <p className="mt-4 text-xs text-gray-500 italic">

                  Disclaimer: AI-generated suggestions are indicative and
                  may vary depending on facts and legal interpretation.

                </p>

              </Section>

            )}

            {/* Legal Guidance */}

            <Section
              icon={<ArrowRightCircle size={20} />}
              title="Suggested Next Steps"
            >

              {typeof legal_guidance === "string" ? (

                <div className="text-gray-700 whitespace-pre-line">
                  {legal_guidance}
                </div>

              ) : legal_guidance?.procedure ? (

                <>
                  <ul className="list-disc ml-6 text-gray-700 space-y-1">

                    {legal_guidance.procedure.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}

                  </ul>

                  {legal_guidance.note && (

                    <p className="mt-3 text-sm text-gray-600">
                      {legal_guidance.note}
                    </p>

                  )}

                </>

              ) : (

                <p className="text-gray-700">
                  Suggested steps will appear after analysis.
                </p>

              )}

            </Section>

            {/* Related Judgments */}

            <Section
              icon={<Scale size={20} />}
              title="Related Judgments"
            >

              {judgments.length > 0 ? (

                <ul className="space-y-2">

                  {judgments.map((j, index) => (

                    <li key={index}>

                      <a
                        href={j.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg border border-blue-200 hover:bg-blue-50 transition text-[#1E3A8A] font-medium"
                      >
                        {j.title}
                      </a>

                    </li>

                  ))}

                </ul>

              ) : (

                <p className="text-gray-600">
                  No related judgments found.
                </p>

              )}

            </Section>

            {/* Back Button */}

            <button
              onClick={() => navigate("/home")}
              className="w-full py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1D4ED8] transition"
            >
              Go Back to Home
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

/* Section Component */

function Section({ icon, title, children }) {

  return (

    <div className="border-l-4 border-[#1E3A8A] pl-4 space-y-3">

      <div className="flex items-center gap-2 text-[#1E3A8A]">

        {icon}

        <h2 className="text-lg md:text-xl font-semibold">
          {title}
        </h2>

      </div>

      {children}

    </div>

  );

}
