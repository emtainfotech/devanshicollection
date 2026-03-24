import { Link } from 'react-router-dom';

interface BrandLogoProps {
  compact?: boolean;
  withTagline?: boolean;
  className?: string;
}

const BrandLogo = ({ compact = false, withTagline = false, className = '' }: BrandLogoProps) => {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <img
        src="/logo-devanshi.svg"
        alt="Devanshi Collection logo"
        className={compact ? 'h-8 w-auto' : 'h-10 w-auto md:h-12'}
        loading="eager"
      />
      {/* <span className="leading-tight">
        <span className="block font-display text-xl md:text-2xl font-semibold tracking-tight text-foreground">
          DEVANSHI
        </span>
        <span className="block -mt-1 font-display text-lg md:text-xl font-medium tracking-wide text-primary">
          COLLECTION
        </span>
        {withTagline && (
          <span className="hidden md:block mt-0.5 text-[10px] tracking-[0.2em] font-body text-muted-foreground uppercase">
            Indian Wear Studio
          </span>
        )}
      </span> */}
    </Link>
  );
};

export default BrandLogo;
