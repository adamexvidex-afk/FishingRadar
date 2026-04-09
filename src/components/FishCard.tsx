interface FishCardProps {
  fish: {
    id?: string;
    name_en: string;
    latin_name: string | null;
    image_url: string | null;
  };
  index: number;
  onClick: () => void;
  translatedName?: string;
}

const FishCard = ({ fish, onClick, translatedName }: FishCardProps) => {
  const displayName = translatedName || fish.name_en;

  return (
    <button
      onClick={onClick}
      className="group text-left w-full"
    >
      <div className="rounded-2xl bg-card border border-border/50 overflow-hidden shadow-card transition-all duration-300 hover:shadow-elevated hover:border-primary/20 active:scale-[0.97]">
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted/30">
          {fish.image_url ? (
            <img
              src={fish.image_url}
              alt={displayName}
              className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-4xl opacity-40">🐟</div>
          )}
        </div>
        <div className="p-3.5 pt-2.5">
          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-200 leading-tight">
            {displayName}
          </h3>
          <p className="text-xs italic text-muted-foreground mt-0.5">{fish.latin_name}</p>
        </div>
      </div>
    </button>
  );
};

export default FishCard;
