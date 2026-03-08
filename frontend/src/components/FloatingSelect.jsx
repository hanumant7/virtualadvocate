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
        className="w-full p-3 pt-5 rounded-lg outline-none border-2 
                   text-black transition-all duration-200 
                   appearance-none"
        style={{
          backgroundColor: "#BDDDE4",
          borderColor: focused ? "#090979" : "#3B82F6",
        }}
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
        className={`absolute left-3 transition-all duration-200 px-1 pointer-events-none
          ${
            isActive
              ? "-top-2 text-sm bg-[#9EC6F3] text-[#090979]"
              : "top-4 text-base text-gray-500"
          }
        `}
      >
        {label}
      </label>
    </div>
  );
}