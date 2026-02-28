'use client';

import { useEffect, useState } from 'react';
import {
  Code2,
  Megaphone,
  BarChart2,
  Settings,
  Heart,
  GraduationCap,
  Building2,
  Paintbrush,
  LayoutGrid,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  selected: string;
  onSelect: (id: string) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  default: LayoutGrid,
  tech: Code2,
  marketing: Megaphone,
  finance: BarChart2,
  engineering: Settings,
  healthcare: Heart,
  education: GraduationCap,
  construction: Building2,
  design: Paintbrush,
};

function getCategoryIcon(name: string): React.ElementType {
  const lower = name.toLowerCase();
  if (lower.includes('tech') || lower.includes('it') || lower.includes('phần mềm')) return Code2;
  if (lower.includes('market') || lower.includes('tiếp thị')) return Megaphone;
  if (lower.includes('finance') || lower.includes('tài chính') || lower.includes('kế toán'))
    return BarChart2;
  if (lower.includes('engineer') || lower.includes('kỹ thuật')) return Settings;
  if (lower.includes('health') || lower.includes('y tế') || lower.includes('dược')) return Heart;
  if (lower.includes('edu') || lower.includes('giáo dục')) return GraduationCap;
  if (lower.includes('design') || lower.includes('thiết kế')) return Paintbrush;
  if (lower.includes('xây dựng') || lower.includes('construct')) return Building2;
  return LayoutGrid;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/jobs/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories ?? data ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const allItem = { id: 'all', name: 'Tất cả' };
  const items = [allItem, ...categories];

  return (
    <section className="sticky top-0 z-20 border-b border-gray-100 bg-white py-6 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent flex items-center gap-3 overflow-x-auto pb-1">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-9 w-28 shrink-0 animate-pulse rounded-full bg-gray-100" />
              ))
            : items.map((cat) => {
                const Icon = cat.id === 'all' ? LayoutGrid : getCategoryIcon(cat.name);
                const isActive = selected === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id)}
                    className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                      isActive
                        ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                    {cat.name}
                  </button>
                );
              })}
        </div>
      </div>
    </section>
  );
}
