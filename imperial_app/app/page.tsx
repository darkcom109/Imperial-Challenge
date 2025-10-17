'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Target,
  Plus,
  Search,
  Filter,
  Trash2,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Lightbulb,
  Heart,
  Plane,
  Package
} from 'lucide-react';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const categories = [
  { name: 'Food & Dining', color: 'bg-gradient-to-r from-red-400 to-pink-500', icon: Utensils, chartColor: '#ef4444' },
  { name: 'Transportation', color: 'bg-gradient-to-r from-blue-400 to-cyan-500', icon: Car, chartColor: '#3b82f6' },
  { name: 'Shopping', color: 'bg-gradient-to-r from-green-400 to-emerald-500', icon: ShoppingBag, chartColor: '#10b981' },
  { name: 'Entertainment', color: 'bg-gradient-to-r from-purple-400 to-violet-500', icon: Film, chartColor: '#8b5cf6' },
  { name: 'Bills & Utilities', color: 'bg-gradient-to-r from-yellow-400 to-orange-500', icon: Lightbulb, chartColor: '#f59e0b' },
  { name: 'Healthcare', color: 'bg-gradient-to-r from-pink-400 to-rose-500', icon: Heart, chartColor: '#ec4899' },
  { name: 'Travel', color: 'bg-gradient-to-r from-indigo-400 to-blue-500', icon: Plane, chartColor: '#6366f1' },
  { name: 'Other', color: 'bg-gradient-to-r from-gray-400 to-slate-500', icon: Package, chartColor: '#6b7280' }
];

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formRef, setFormRef] = useState<HTMLDivElement | null>(null);

  // Load expenses from localStorage on component mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // Save expenses to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString().split('T')[0]
    };

    setExpenses([...expenses, newExpense]);
    setDescription('');
    setAmount('');
    setShowAddForm(false);
  };

  const handleAddExpenseClick = () => {
    setShowAddForm(true);
    // Scroll to form after a short delay to ensure it's rendered
    setTimeout(() => {
      if (formRef) {
        formRef.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Filter expenses based on search and category
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate expenses by category for chart
  const expensesByCategory = categories.map(cat => ({
    name: cat.name,
    amount: expenses
      .filter(expense => expense.category === cat.name)
      .reduce((sum, expense) => sum + expense.amount, 0),
    color: cat.color,
    icon: cat.icon,
    chartColor: cat.chartColor
  })).filter(cat => cat.amount > 0);

  // Prepare data for charts
  const pieChartData = expensesByCategory.map(cat => ({
    name: cat.name,
    value: cat.amount,
    color: cat.chartColor
  }));

  // Weekly spending data for line chart
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayExpenses = expenses.filter(expense => expense.date === dateStr);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: dayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    };
  });


  // Get recent expenses (last 7 days)
  const recentExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return expenseDate >= weekAgo;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                <DollarSign className="w-8 h-8 mr-3 text-blue-600" />
                Expense Tracker
              </h1>
              <p className="text-slate-600 mt-1 font-medium">Manage your finances with ease</p>
            </div>
            <button
              onClick={handleAddExpenseClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-600">Total Expenses</p>
                <p className="text-2xl font-bold text-slate-900">${totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-600">Transactions</p>
                <p className="text-2xl font-bold text-slate-900">{expenses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-600">This Week</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${recentExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-purple-400 to-violet-500 rounded-2xl shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-600">Avg. per Day</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${expenses.length > 0 ? (totalExpenses / Math.max(1, expenses.length)).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Spending Distribution</h2>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-500">
                <p>No data to display</p>
              </div>
            )}
          </div>

          {/* Weekly Spending Line Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Weekly Spending Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Expense Form */}
          {showAddForm && (
            <div className="lg:col-span-3" ref={setFormRef}>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">Add New Expense</h2>
                <form onSubmit={addExpense} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Coffee at Starbucks"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                    >
                      Add Expense
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Category Breakdown Chart */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">Spending by Category</h2>
              {expensesByCategory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No expenses yet</p>
              ) : (
                <div className="space-y-4">
                  {expensesByCategory.map((cat) => {
                    const percentage = (cat.amount / totalExpenses) * 100;
                    return (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${cat.color} shadow-sm`}></div>
                          <span className="text-sm font-semibold text-slate-700 flex items-center">
                            <cat.icon className="w-4 h-4 mr-2" />
                            {cat.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">${cat.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Recent Expenses</h2>
                <div className="flex space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search expenses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="All">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {filteredExpenses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {expenses.length === 0 ? 'No expenses yet. Add your first expense!' : 'No expenses match your search.'}
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredExpenses.slice().reverse().map((expense) => {
                    const categoryInfo = categories.find(cat => cat.name === expense.category);
                    return (
                      <div key={expense.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl hover:from-slate-100 hover:to-blue-100 transition-all duration-300 border border-white/50 shadow-sm hover:shadow-md">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl ${categoryInfo?.color || 'bg-gradient-to-r from-gray-400 to-slate-500'} flex items-center justify-center text-white font-bold shadow-lg`}>
                            {categoryInfo?.icon && <categoryInfo.icon className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{expense.description}</p>
                            <p className="text-sm text-gray-500">{expense.category} • {expense.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold text-red-600 text-lg">${expense.amount.toFixed(2)}</span>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
