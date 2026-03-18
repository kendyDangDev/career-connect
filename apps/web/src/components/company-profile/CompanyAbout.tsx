interface CompanyAboutProps {
  description: string;
  techStack?: string[];
}

export function CompanyAbout({ description, techStack }: CompanyAboutProps) {
  return (
    <div className="space-y-6">
      {/* About Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-violet-600" />
          <h2 className="text-lg font-bold text-gray-900">About the Company</h2>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-line text-gray-600">{description}</p>
      </div>

      {/* Tech Stack */}
      {techStack && techStack.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-7 w-1.5 rounded-full bg-violet-600" />
            <h2 className="text-lg font-bold text-gray-900">Tech Stack</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
