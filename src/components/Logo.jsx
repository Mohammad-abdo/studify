import { motion } from 'framer-motion';

const Logo = ({ className = '', size = 'default', variant = 'default' }) => {
  const sizes = {
    small: 'text-sm',
    default: 'text-2xl',
    large: 'text-3xl',
  };

  const lightbulbSizes = {
    small: { width: 16, height: 18, offset: -4 },
    default: { width: 24, height: 28, offset: -6 },
    large: { width: 32, height: 36, offset: -8 },
  };

  const lbSize = lightbulbSizes[size];

  // If variant is 'icon', show just the lightbulb
  if (variant === 'icon') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className={`${className}`}
      >
        <svg
          width={lbSize.width}
          height={lbSize.height}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="9" y="18" width="6" height="4" rx="1" fill="#0f766e" />
          <path
            d="M12 2C9.24 2 7 4.24 7 7C7 9.31 8.35 11.28 10.3 11.85V15H13.7V11.85C15.65 11.28 17 9.31 17 7C17 4.24 14.76 2 12 2Z"
            fill="#fbbf24"
            stroke="#0f766e"
            strokeWidth="1.2"
          />
          <path
            d="M12 8C13.1 8 14 8.9 14 10C14 10.55 13.78 11.05 13.41 11.41"
            stroke="#0f766e"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M10 10C10 8.9 10.9 8 12 8"
            stroke="#0f766e"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-0.5 ${className}`}
    >
      {/* STUDIF Text */}
      <span
        className={`font-black text-white ${sizes[size]} relative`}
        style={{
          fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
          textShadow: '2px 2px 0px #0f766e, -1px -1px 0px #0f766e, 1px -1px 0px #0f766e, -1px 1px 0px #0f766e',
          letterSpacing: '0.03em',
          fontWeight: 900,
        }}
      >
        STUDIF
      </span>

      {/* 'Y' with lightbulb above */}
      <div className="relative inline-flex items-start">
        <span
          className={`font-black text-white ${sizes[size]} relative`}
          style={{
            fontFamily: '"Arial Black", "Arial Bold", Arial, sans-serif',
            textShadow: '2px 2px 0px #0f766e, -1px -1px 0px #0f766e, 1px -1px 0px #0f766e, -1px 1px 0px #0f766e',
            letterSpacing: '0.03em',
            fontWeight: 900,
          }}
        >
          Y
        </span>

        {/* Lightbulb SVG positioned above 'Y' */}
        <motion.svg
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="absolute"
          style={{
            top: lbSize.offset,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          width={lbSize.width}
          height={lbSize.height}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Lightbulb base (teal) */}
          <rect x="9" y="18" width="6" height="4" rx="1" fill="#0f766e" />
          {/* Lightbulb glass (yellow) */}
          <path
            d="M12 2C9.24 2 7 4.24 7 7C7 9.31 8.35 11.28 10.3 11.85V15H13.7V11.85C15.65 11.28 17 9.31 17 7C17 4.24 14.76 2 12 2Z"
            fill="#fbbf24"
            stroke="#0f766e"
            strokeWidth="1.2"
          />
          {/* Filament */}
          <path
            d="M12 8C13.1 8 14 8.9 14 10C14 10.55 13.78 11.05 13.41 11.41"
            stroke="#0f766e"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M10 10C10 8.9 10.9 8 12 8"
            stroke="#0f766e"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </motion.svg>
      </div>
    </motion.div>
  );
};

export default Logo;
