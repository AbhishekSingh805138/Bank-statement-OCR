import React from 'react';
import { categoryMap } from './categoryConfig';

interface CategoryChartProps {
    spendingData: { [key: string]: number };
    totalSpending: number;
    currency: string;
}

const getCurrencySymbol = (currencyCode: string): string => {
    const upperCaseCode = (currencyCode || 'USD').toUpperCase();
    switch (upperCaseCode) {
        case 'USD': case 'CAD': case 'AUD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'INR': return '₹';
        case 'JPY': case 'CNY': return '¥';
        default: return `${upperCaseCode} `;
    }
};

export const CategoryChart: React.FC<CategoryChartProps> = ({ spendingData, totalSpending, currency }) => {
    const sortedCategories = Object.entries(spendingData).sort(([, a], [, b]) => b - a);
    const currencySymbol = getCurrencySymbol(currency);

    return (
        <div className="bg-slate-800 rounded-xl shadow-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-slate-100 mb-6">Spending by Category</h3>
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                {/* Left Side: Total Spent */}
                <div className="text-center md:text-left">
                    <p className="text-sm text-slate-400">Total Spent</p>
                    <p className="text-4xl font-bold text-slate-100 mt-1">
                        {currencySymbol}{totalSpending.toFixed(2)}
                    </p>
                </div>
                
                {/* Right Side: Category List */}
                <div className="w-full md:w-auto md:min-w-[320px]">
                    <ul className="space-y-3">
                        {sortedCategories.map(([category, amount]) => {
                            const normalizedCategory = category.toLowerCase().trim();
                            const categoryInfo = categoryMap[normalizedCategory] || categoryMap.default;
                            
                            // Extract color from text class, e.g., 'text-red-400' -> 'bg-red-400'
                            const colorClass = categoryInfo.color.split(' ').find(c => c.startsWith('text-'))?.replace('text-', 'bg-') || 'bg-slate-400';
                            
                            const percentage = (amount / totalSpending) * 100;

                            return (
                                <li key={category} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`}></span>
                                        <span className="text-slate-300">{category}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold text-slate-100">{currencySymbol}{amount.toFixed(2)}</span>
                                        <span className="ml-3 text-xs text-slate-400 w-14 inline-block text-left">({percentage.toFixed(1)}%)</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};
