type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="max-w-2xl space-y-4 relative z-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-900">{eyebrow}</p>
      <h2 className="text-3xl font-serif italic tracking-tight text-zinc-900 sm:text-4xl">{title}</h2>
      {description ? <p className="text-xs font-bold uppercase tracking-widest leading-relaxed text-zinc-500 mt-4">{description}</p> : null}
    </div>
  );
}
