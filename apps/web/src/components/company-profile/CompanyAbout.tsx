interface CompanyAboutProps {
  description: string;
  techStack?: string[];
}

export function CompanyAbout({ description, techStack }: CompanyAboutProps) {
  return (
    <div className="space-y-6">
      {/* About Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-900">About the Company</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{description}</p>
      </div>

      {/* Tech Stack */}
      {techStack && techStack.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Tech Stack</h2>
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
