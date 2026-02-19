import React, { useState, useMemo } from 'react';
import { categoryMap } from './categoryConfig';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { TotalTransactionsIcon } from './icons/TotalTransactionsIcon';
import { SpendingIcon } from './icons/SpendingIcon';
import { IncomeIcon } from './icons/IncomeIcon';
import { CategoryChart } from './CategoryChart';

interface ResultDisplayProps {
  currency: string;
  csvData: string;
}

const getCurrencySymbol = (currencyCode: string): string => {
    const upperCaseCode = (currencyCode || 'USD').toUpperCase();
    switch (upperCaseCode) {
        case 'USD':
        case 'CAD':
        case 'AUD':
            return '$';
        case 'EUR':
            return '€';
        case 'GBP':
            return '£';
        case 'INR':
            return '₹';
        case 'JPY':
        case 'CNY':
            return '¥';
        default:
            return `${upperCaseCode} `;
    }
};

const SummaryCard: React.FC<{ icon: React.ReactNode; label: string; value: string; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className="flex-1 p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-xl font-bold text-slate-100">{value}</p>
        </div>
    </div>
);

const CSVTable: React.FC<{ csv: string; currency: string; headers: string[], data: string[][] }> = ({ csv, currency, headers, data }) => {
    if (headers.length === 0) {
        return <p className="text-slate-500 text-center py-8">No transaction data found in the response.</p>
    }

    const currencySymbol = getCurrencySymbol(currency);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700/50">
                    <tr>
                        {headers.map((header) => (
                            <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-slate-700">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-slate-700/50 transition-colors">
                            {row.map((cell, cellIndex) => {
                                const header = headers[cellIndex];
                                const isAmount = header === 'Amount';
                                const amount = isAmount ? parseFloat(cell.replace(/[^0-9.-]+/g,"")) : 0;
                                const isCredit = isAmount && amount > 0;
                                
                                return (
                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        {header === 'Category' ? (
                                            (() => {
                                                const category = cell || 'Uncategorized';
                                                const normalizedCategory = category.toLowerCase().trim();
                                                const { icon: Icon, color } = categoryMap[normalizedCategory] || categoryMap.default;
                                                const textColor = color.split(' ')[1] || 'text-slate-300';
                                                return (
                                                    <div className="flex items-center gap-x-2">
                                                        <Icon className={`h-5 w-5 ${textColor}`} />
                                                        <span>{category}</span>
                                                    </div>
                                                );
                                            })()
                                        ) : isAmount ? (
                                            <span className={`font-semibold ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                                                {isCredit ? '+' : '-'}{currencySymbol}{Math.abs(amount).toFixed(2)}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">{cell}</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ currency, csvData }) => {
    const [isCsvCopied, setIsCsvCopied] = useState(false);
    
    const { headers, data, totalRecords, totalSpending, totalIncome, spendingByCategory } = useMemo(() => {
        const lines = csvData.trim().split('\n');
        if (lines.length < 2 || lines[0] === '') {
            return { headers: [], data: [], totalRecords: 0, totalSpending: 0, totalIncome: 0, spendingByCategory: {} };
        }
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => {
            const values = line.split(',');
            // Pad row with empty strings if it's shorter than headers
            while (values.length < headers.length) {
                values.push('');
            }
            return values.map(d => d.trim());
        });

        const amountIndex = headers.findIndex(h => h.toLowerCase() === 'amount');
        const categoryIndex = headers.findIndex(h => h.toLowerCase() === 'category');
        let spending = 0;
        let income = 0;
        const spendingByCategory: { [key: string]: number } = {};

        if (amountIndex !== -1) {
            data.forEach(row => {
                const amountStr = row[amountIndex];
                if (amountStr) {
                    const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ""));
                    if (!isNaN(amount)) {
                        if (amount < 0) {
                            spending += amount;
                             if (categoryIndex !== -1) {
                                const category = row[categoryIndex] || 'Uncategorized';
                                spendingByCategory[category] = (spendingByCategory[category] || 0) + Math.abs(amount);
                            }
                        } else {
                            income += amount;
                        }
                    }
                }
            });
        }
        
        return { 
            headers, 
            data, 
            totalRecords: data.length, 
            totalSpending: Math.abs(spending), 
            totalIncome: income,
            spendingByCategory
        };
    }, [csvData]);

    const handleCopyCsv = () => {
        const csvContent = csvData.trim();
        if (csvContent) {
            navigator.clipboard.writeText(csvContent);
            setIsCsvCopied(true);
            setTimeout(() => setIsCsvCopied(false), 2500);
        }
    };
    
    const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="space-y-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Analysis Results</h2>
            <button
                onClick={handleCopyCsv}
                className={`inline-flex items-center justify-center gap-x-2 w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                    isCsvCopied 
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
            >
                {isCsvCopied ? (
                    <CheckIcon className="h-5 w-5" />
                ) : (
                    <ClipboardIcon className="h-5 w-5" />
                )}
                {isCsvCopied ? 'Copied!' : 'Copy to CSV'}
            </button>
        </div>
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SummaryCard 
                icon={<TotalTransactionsIcon className="w-6 h-6 text-cyan-300" />}
                label="Total Transactions"
                value={totalRecords.toString()}
                colorClass="bg-cyan-900/50"
            />
            <SummaryCard 
                icon={<SpendingIcon className="w-6 h-6 text-red-400" />}
                label="Total Spending"
                value={`${currencySymbol}${totalSpending.toFixed(2)}`}
                colorClass="bg-red-900/50"
            />
            <SummaryCard 
                icon={<IncomeIcon className="w-6 h-6 text-green-400" />}
                label="Total Income"
                value={`${currencySymbol}${totalIncome.toFixed(2)}`}
                colorClass="bg-green-900/50"
            />
        </div>
        
        {totalSpending > 0 && (
            <CategoryChart 
                spendingData={spendingByCategory}
                totalSpending={totalSpending}
                currency={currency}
            />
        )}

        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-4">Extracted Transactions</h2>
            <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
                <CSVTable csv={csvData} currency={currency} headers={headers} data={data} />
            </div>
        </div>
    </div>
  );
};