import React from "react";

interface SlothMascotProps {
  className?: string;
  size?: number;
}

export const SlothMascot: React.FC<SlothMascotProps> = ({ className = "", size = 64 }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:rotate-3"
      >
        {/* Branch */}
        <path
          d="M 5 45 C 40 40, 80 50, 115 42"
          stroke="#704f35"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Green leaves */}
        <path
          d="M 15 42 C 10 32, 22 26, 25 38 Z"
          fill="#4a6b4e"
        />
        <path
          d="M 28 44 C 35 34, 46 40, 36 48 Z"
          fill="#608665"
        />
        <path
          d="M 100 40 C 108 30, 116 38, 108 45 Z"
          fill="#4a6b4e"
        />

        {/* Sloth arms holding branch */}
        <path
          d="M 42 45 C 42 55, 48 68, 52 75"
          stroke="#a78255"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M 78 45 C 78 55, 72 68, 68 75"
          stroke="#a78255"
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* Sloth Body */}
        <ellipse cx="60" cy="80" rx="26" ry="24" fill="#a78255" />
        <ellipse cx="60" cy="83" rx="19" ry="17" fill="#d7c09e" />

        {/* Sloth Head */}
        <circle cx="60" cy="62" r="18" fill="#c5a378" />

        {/* Eye Mask Patches */}
        <path
          d="M 48 57 C 48 53, 56 55, 56 61 C 56 65, 48 64, 48 57 Z"
          fill="#704f35"
        />
        <path
          d="M 72 57 C 72 53, 64 55, 64 61 C 64 65, 72 64, 72 57 Z"
          fill="#704f35"
        />

        {/* Peaceful Sleeping / Smiling Eyes */}
        <path
          d="M 50 60 Q 52 63 54 60"
          stroke="#fbf8f3"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 66 60 Q 68 63 70 60"
          stroke="#fbf8f3"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Snout */}
        <ellipse cx="60" cy="67" rx="7" ry="5" fill="#f4ede2" />
        <ellipse cx="60" cy="65.5" rx="3.5" ry="2.2" fill="#4d3626" />
        <path
          d="M 58 68 Q 60 70 62 68"
          stroke="#4d3626"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Tiny Zzz sleep bubble animation */}
        <text x="82" y="30" fill="#a78255" fontSize="11" fontWeight="bold" opacity="0.85">
          z
        </text>
        <text x="92" y="22" fill="#704f35" fontSize="14" fontWeight="bold" opacity="0.95">
          Z
        </text>
      </svg>
    </div>
  );
};
