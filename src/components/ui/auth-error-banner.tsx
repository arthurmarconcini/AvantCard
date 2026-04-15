interface AuthErrorBannerProps {
  message: string;
}

export function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
      {message}
    </div>
  );
}
