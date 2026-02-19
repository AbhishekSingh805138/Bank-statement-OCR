import React from 'react';
import { categoryMap } from './categoryConfig';

interface CategoryPillProps {
  category: string;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({ category }) => {
  const normalizedCategory = category.toLowerCase().trim();
  const { icon: Icon, color } = categoryMap[normalizedCategory] || categoryMap.default;

  return (
    <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {category}
    </span>
  );
};