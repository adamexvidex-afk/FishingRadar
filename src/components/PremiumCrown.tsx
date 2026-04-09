import { Crown } from 'lucide-react';

interface PremiumCrownProps {
  isPremium?: boolean;
  className?: string;
}

const PremiumCrown = ({ isPremium, className = '' }: PremiumCrownProps) => {
  if (!isPremium) return null;
  return (
    <Crown className={`h-3.5 w-3.5 text-blue-500 fill-blue-500 inline-block shrink-0 ${className}`} />
  );
};

export default PremiumCrown;
