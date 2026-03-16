import { useState } from "react";

export default function FloatingSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  disabled = false,
}) {

  const [focused, setFocused] = useState(false);

  const isActive = focused || (value && value.length > 0);

  return (

    <div className="relative mb-5">

      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full p-3 pt-5 rounded-lg outline-none border text-[#1E3A8A]
        bg-white transition-all duration-200 appearance-none
        ${focused ? "border-[#1E3A8A] ring-2 ring-blue-200" : "border-blue-200"}
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >

        <option value=""></option>

        {options.map((opt, index) => (

          <option key={index} value={opt}>
            {opt}
          </option>

        ))}

      </select>

      {/* Floating Label */}

      <label
        className={`absolute left-3 px-1 transition-all duration-200 pointer-events-none
        ${
          isActive
            ? "-top-2 text-sm bg-white text-[#1E3A8A]"
            : "top-4 text-base text-gray-500"
        }`}
      >
        {label}
      </label>

    </div>

  );

}
