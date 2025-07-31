import React, { useState, useEffect } from 'react';
import './App.css';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const App = () => {
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('expenses')) || []);
  const [form, setForm] = useState({ amount: '', category: '', description: '', date: '' });
  const [budget, setBudget] = useState(() => parseFloat(localStorage.getItem('budget')) || 0);
  const [remainingBudget, setRemainingBudget] = useState(budget);
  const [snapshotFrequency, setSnapshotFrequency] = useState(() => localStorage.getItem('snapshotFrequency') || 'weekly');
  const [saves, setSaves] = useState(() => JSON.parse(localStorage.getItem('saves')) || []);
  const [view, setView] = useState('tracker');
  const [darkMode, setDarkMode] = useState(false);
  const [wallet, setWallet] = useState(() => localStorage.getItem('wallet') || 'personal');

  useEffect(() => localStorage.setItem('expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => {
    localStorage.setItem('budget', budget);
    const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    setRemainingBudget(budget - spent);
  }, [budget, expenses]);
  useEffect(() => localStorage.setItem('snapshotFrequency', snapshotFrequency), [snapshotFrequency]);
  useEffect(() => localStorage.setItem('saves', JSON.stringify(saves)), [saves]);
  useEffect(() => localStorage.setItem('wallet', wallet), [wallet]);
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) return;
    const newExpense = { id: Date.now(), ...form, amount: parseFloat(form.amount) };
    setExpenses([...expenses, newExpense]);
    setForm({ amount: '', category: '', description: '', date: '' });
  };

  const handleDelete = (id) => setExpenses(expenses.filter(exp => exp.id !== id));

  const handleClearAll = () => {
    setExpenses([]);
    localStorage.removeItem('expenses');
  };

  const handleSave = () => {
    const timestamp = new Date().toLocaleString();
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const save = { id: Date.now(), timestamp, wallet, budget, totalSpent, expenses: [...expenses] };
    setSaves([...saves, save]);
  };

  const clearSaves = () => {
    setSaves([]);
    localStorage.removeItem('saves');
  };

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const unspentData = [
    { name: 'Spent', value: total },
    { name: 'Unspent', value: budget - total }
  ];

  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});
  const categoryData = Object.entries(categoryTotals).map(([key, value]) => ({ name: key, value }));

  const COLORS = ['#8884d8', '#82ca9d', '#ff6b6b', '#feca57', '#1dd1a1', '#54a0ff'];






  
}

export default App;
