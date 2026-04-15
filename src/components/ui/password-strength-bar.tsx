const STRENGTH_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-emerald-500",
  "bg-primary",
];

const STRENGTH_LABELS = [
  "Muito fraca",
  "Fraca",
  "Razoável",
  "Boa",
  "Excelente",
];

interface PasswordStrengthBarProps {
  score: number;
  showHint?: boolean;
}

export function PasswordStrengthBar({
  score,
  showHint = false,
}: PasswordStrengthBarProps) {
  return (
    <div className="space-y-1.5 mt-2">
      {score > 0 && (
        <>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < score ? STRENGTH_COLORS[score - 1] : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
          <p
            className={`text-[11px] font-medium ml-0.5 transition-colors ${
              score <= 2
                ? "text-red-400"
                : score <= 3
                  ? "text-yellow-400"
                  : "text-primary"
            }`}
          >
            {STRENGTH_LABELS[score - 1]}
          </p>
        </>
      )}

      {showHint && (
        <p className="text-[11px] text-zinc-500 mt-2 ml-1 leading-relaxed">
          Mínimo 8 caracteres, 1 maiúscula, 1 número e 1 especial.
        </p>
      )}
    </div>
  );
}
