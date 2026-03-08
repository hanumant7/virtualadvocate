import { useState } from "react";

export default function FloatingInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  min,
  max,
  disabled = false,
}) {
  const [focused, setFocused] = useState(false);

  const isActive = focused || (value && value.length > 0);

  return (
    <div className="relative mb-5">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full p-3 pt-5 rounded-lg outline-none border-2 text-black transition-all duration-200"
        style={{
          backgroundColor: "#BDDDE4",
          borderColor: focused ? "#090979" : "#3B82F6",
        }}
      />

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
