import { useState } from 'react';

interface Props {
  text: string;
}

export const InfoTooltip = ({ text }: Props) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <button
        type="button"
        className="cursor-pointer flex h-4 w-4 items-center justify-center rounded-full text-current opacity-40 transition-opacity hover:opacity-70"
        aria-label="More info"
        onClick={(e) => {
          e.stopPropagation();
          setVisible((v) => !v);
        }}
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
      </button>
      {visible && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-normal rounded-lg bg-slate-900 px-3 py-2 text-xs font-normal normal-case tracking-normal leading-relaxed text-white shadow-lg w-52 text-center pointer-events-none">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </span>
      )}
    </span>
  );
};
