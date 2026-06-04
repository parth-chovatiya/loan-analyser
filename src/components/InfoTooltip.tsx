import { useState } from 'react';
import { Info } from 'lucide-react';

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
        <Info className="h-3.5 w-3.5" strokeWidth={2} />
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
