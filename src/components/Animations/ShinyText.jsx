export const ShinyText = ({ text, disabled = false, speed = 5, className = '' }) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`bg-clip-text inline-block ${disabled ? '' : 'animate-shine'} ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(120deg, rgba(255, 255, 255, 0.6) 40%, rgba(255, 255, 255, 1.0) 50%, rgba(255, 255, 255, 0.6) 60%)',
        backgroundSize: '200% 100%',
        backgroundPosition: '0% center',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animationDuration
      }}
    >
      {text}
    </div>
  );
};