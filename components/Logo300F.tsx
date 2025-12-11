export default function Logo300F({ className = '', variant = 'light', size = 'default' }: { className?: string; variant?: 'light' | 'dark'; size?: 'default' | 'small' }) {
  const textColor = variant === 'dark' ? 'text-white' : 'text-black';
  const redColor = 'text-ecosystem-red';
  
  const textSize = size === 'small' ? 'text-2xl' : 'text-6xl';
  const subtitleSize = size === 'small' ? 'text-[8px]' : 'text-xs';
  
  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div className="flex items-baseline">
        <span className={`${textSize} font-black ${textColor}`}>300</span>
        <span className={`${textSize} font-black ${redColor}`}>F</span>
      </div>
      <p className={`${subtitleSize} font-semibold ${textColor} tracking-wider mt-0.5`}>
        ACELERADORA DE FRANQUIAS
      </p>
    </div>
  );
}

