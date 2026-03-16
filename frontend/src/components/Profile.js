import React, { useState } from "react";
import { User, Mail, Phone, Edit3, Calendar } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import FloatingInput from "./FloatingInput";
import FloatingSelect from "./FloatingSelect";

export default function Profile({ user, onClose }) {
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    phone: user?.phone || "",
    age: user?.age || "",
    gender: user?.gender || "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        phone: form.phone,
        age: form.age,
        gender: form.gender,
      });

      setEditing(false);
      onClose();
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">

      {/* Modal */}
      <div className="bg-white/90 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-lg font-bold"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-8">

          <div className="flex justify-center mb-4">
            <div className="bg-[#1E3A8A] p-4 rounded-full shadow-lg">
              <User size={36} className="text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#1E3A8A]">
            {user?.name || "User"}
          </h1>

          <p className="text-sm text-gray-500">
            Virtual Advocate Account
          </p>

        </div>

        {/* ACCOUNT INFO */}
        <Section icon={<Mail size={18} />} title="Account Information">

          <ProfileRow label="Email" value={user?.email} icon={<Mail size={16} />} />

          <ProfileRow
            label="Joined"
            value={user?.joinedDate}
            icon={<Calendar size={16} />}
          />

        </Section>

        {/* PERSONAL INFO */}
        <Section icon={<Phone size={18} />} title="Personal Information">

          {editing ? (
            <>
              <FloatingInput
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />

              <FloatingInput
                label="Age"
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

              <button
                onClick={handleSave}
                className="w-full py-3 mt-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-blue-900 transition font-semibold"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <ProfileRow label="Phone" value={user?.phone} />

              <ProfileRow label="Age" value={user?.age} />

              <ProfileRow label="Gender" value={user?.gender} />

              <button
                onClick={() => setEditing(true)}
                className="w-full py-3 bg-[#1E3A8A] text-white rounded-lg mt-4 hover:bg-blue-900 transition flex items-center justify-center gap-2 font-semibold"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            </>
          )}

        </Section>

      </div>
    </div>
  );
}

/* Section Component */
function Section({ icon, title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm space-y-3">

      <div className="flex items-center gap-2 text-[#1E3A8A]">

        {icon}

        <h2 className="text-lg font-semibold">
          {title}
        </h2>

      </div>

      {children}

    </div>
  );
}

/* Row */
function ProfileRow({ label, value, icon }) {
  return (
    <div className="flex justify-between items-center text-gray-700 border-b border-gray-100 pb-2">

      <div className="flex items-center gap-2 font-medium">
        {icon}
        {label}
      </div>

      <span className="text-[#1E3A8A] font-semibold">
        {value || "—"}
      </span>

    </div>
  );
}
