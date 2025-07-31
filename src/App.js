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
  

export default App;
