interface SectionHeadingProps {
  title: string;
}

export function SectionHeading({ title }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-6 w-1.5 rounded-full bg-primary" />
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
    </div>
  );
}
