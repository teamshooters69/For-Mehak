interface AmbientBackdropProps {
  reducedMotion: boolean;
}

const SPARKLES = [
  { top: '8%', left: '7%', size: 11, delay: '0s', color: '#F3D69B' },
  { top: '17%', right: '10%', size: 13, delay: '1.1s', color: '#9274B8' },
  { top: '38%', left: '4%', size: 10, delay: '2.1s', color: '#702B4C' },
  { top: '52%', right: '5%', size: 9, delay: '0.4s', color: '#F3D69B' },
  { top: '69%', right: '9%', size: 12, delay: '0.9s', color: '#9274B8' },
  { top: '84%', left: '12%', size: 9, delay: '1.8s', color: '#F3D69B' },
];

const FLOATING_HEARTS = [
  { top: '26%', right: '6%', size: 15, delay: '0s', className: 'text-[#702B4C]/18' },
  { top: '58%', left: '6%', size: 13, delay: '1.8s', className: 'text-[#9274B8]/22' },
  { bottom: '18%', right: '14%', size: 11, delay: '3.1s', className: 'text-[#702B4C]/15' },
];

export function AmbientBackdrop({ reducedMotion }: AmbientBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className={`absolute -top-24 -right-20 h-72 w-72 rounded-full opacity-45 blur-3xl sm:h-96 sm:w-96 ${
          reducedMotion ? '' : 'animate-drift-orb'
        }`}
        style={{ background: 'radial-gradient(circle, #E9DFFF 0%, transparent 72%)' }}
      />
      <div
        className={`absolute top-1/3 -left-24 h-80 w-80 rounded-full opacity-40 blur-3xl sm:h-96 sm:w-96 ${
          reducedMotion ? '' : 'animate-drift-orb'
        }`}
        style={{
          background: 'radial-gradient(circle, #FFDCE8 0%, transparent 72%)',
          animationDelay: '3.5s',
        }}
      />
      <div
        className={`absolute right-1/4 bottom-8 h-72 w-72 rounded-full opacity-35 blur-3xl sm:h-88 sm:w-88 ${
          reducedMotion ? '' : 'animate-drift-orb'
        }`}
        style={{
          background: 'radial-gradient(circle, #F3D69B 0%, transparent 70%)',
          animationDelay: '6.5s',
        }}
      />

      {!reducedMotion &&
        SPARKLES.map((item, idx) => (
          <svg
            key={idx}
            viewBox="0 0 24 24"
            width={item.size}
            height={item.size}
            className="animate-sparkle absolute opacity-55"
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              animationDelay: item.delay,
              color: item.color,
            }}
          >
            <path
              fill="currentColor"
              d="M12 2L14.3 9.7L22 12L14.3 14.3L12 22L9.7 14.3L2 12L9.7 9.7L12 2Z"
            />
          </svg>
        ))}

      {!reducedMotion &&
        FLOATING_HEARTS.map((heart, idx) => (
          <svg
            key={idx}
            viewBox="0 0 24 24"
            width={heart.size}
            height={heart.size}
            className={`animate-float-slow absolute ${heart.className}`}
            style={{
              top: heart.top,
              bottom: heart.bottom,
              left: heart.left,
              right: heart.right,
              animationDelay: heart.delay,
            }}
          >
            <path
              fill="currentColor"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        ))}
    </div>
  );
}
