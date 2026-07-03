type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="max-w-2xl space-y-3 relative z-10">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-500 drop-shadow-[0_0_8px_rgba(219,39,119,0.5)]">{eyebrow}</p>
      <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">{title}</h2>
      {description ? <p className="text-base leading-7 text-zinc-500">{description}</p> : null}
    </div>
  );
}
