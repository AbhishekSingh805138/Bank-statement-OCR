import React from 'react';
import { BillsIcon } from './icons/categories/BillsIcon';
import { DefaultCategoryIcon } from './icons/categories/DefaultCategoryIcon';
import { DiningIcon } from './icons/categories/DiningIcon';
import { FuelIcon } from './icons/categories/FuelIcon';
import { GroceriesIcon } from './icons/categories/GroceriesIcon';
import { PharmacyIcon } from './icons/categories/PharmacyIcon';
import { SalaryIcon } from './icons/categories/SalaryIcon';
import { ShoppingIcon } from './icons/categories/ShoppingIcon';
import { TransferIcon } from './icons/categories/TransferIcon';

export const categoryMap: { [key: string]: { icon: React.FC<React.SVGProps<SVGSVGElement>>; color: string } } = {
  bills: { icon: BillsIcon, color: 'bg-red-500/20 text-red-400' },
  dining: { icon: DiningIcon, color: 'bg-orange-500/20 text-orange-400' },
  fuel: { icon: FuelIcon, color: 'bg-amber-500/20 text-amber-400' },
  groceries: { icon: GroceriesIcon, color: 'bg-yellow-500/20 text-yellow-400' },
  pharmacy: { icon: PharmacyIcon, color: 'bg-lime-500/20 text-lime-400' },
  salary: { icon: SalaryIcon, color: 'bg-green-500/20 text-green-400' },
  income: { icon: SalaryIcon, color: 'bg-green-500/20 text-green-400' },
  shopping: { icon: ShoppingIcon, color: 'bg-teal-500/20 text-teal-400' },
  transfer: { icon: TransferIcon, color: 'bg-cyan-500/20 text-cyan-400' },
  investment: { icon: TransferIcon, color: 'bg-sky-500/20 text-sky-400' },
  default: { icon: DefaultCategoryIcon, color: 'bg-slate-700 text-slate-300' },
  uncategorized: { icon: DefaultCategoryIcon, color: 'bg-slate-700 text-slate-300' },
};
