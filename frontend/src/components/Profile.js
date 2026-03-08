import React, { useState } from "react";
import { User, Mail, Phone, Edit3 } from "lucide-react";
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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 font-bold"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-[#090979] p-4 rounded-full shadow">
              <User size={40} className="text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#090979]">
            {user?.name || "User"}
          </h1>
          <p className="text-sm text-gray-500">
            Account Overview
          </p>
        </div>

        {/* ACCOUNT INFO */}
        <Section icon={<Mail size={18} />} title="Account Information">
          <ProfileRow label="Email" value={user?.email} />
          <ProfileRow label="Joined" value={user?.joinedDate} />
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
                className="w-full py-3 bg-[#090979] text-white rounded-lg hover:opacity-90 transition"
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
                className="w-full py-3 bg-[#090979] text-white rounded-lg mt-3 hover:opacity-90 transition flex items-center justify-center gap-2"
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

/* Section */
function Section({ icon, title, children }) {
  return (
    <div className="border-l-4 border-[#8F87F1] pl-4 mb-6 space-y-3">
      <div className="flex items-center gap-2 text-[#090979]">
        {icon}
        <h2 className="text-lg font-semibold">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between text-gray-700">
      <span className="font-medium">{label}</span>
      <span className="text-[#090979] font-semibold">
        {value || "—"}
      </span>
    </div>
  );
}