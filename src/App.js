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


  return (
    <div className="app-container">
      <h1 className="app-title">Expense Tracker</h1>
      <div className="nav-buttons">
        <button onClick={() => setView('tracker')}>Tracker</button>
        <button onClick={() => setView('saves')}>View Saves</button>
        <button className="toggle-dark" onClick={() => setDarkMode(prev => !prev)}>
          Toggle {darkMode ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      {view === 'tracker' ? (
        <>
          <div className="budget-input">
            <label>Set Wallet:</label>
            <select value={wallet} onChange={(e) => setWallet(e.target.value)}>
              <option value="personal">Personal</option>
              <option value="business">Business</option>
              <option value="travel">Travel</option>
            </select>
            <label>Set Total Budget (€):</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
            />
            <label>Snapshot Frequency:</label>
            <select value={snapshotFrequency} onChange={(e) => setSnapshotFrequency(e.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <p className="remaining-budget">Remaining Budget: €{remainingBudget.toFixed(2)}</p>
          </div>

          <form className="expense-form" onSubmit={handleSubmit}>
            <input name="amount" type="number" placeholder="Amount (€)" value={form.amount} onChange={handleChange} />
            <input name="category" type="text" placeholder="Category" value={form.category} onChange={handleChange} />
            <input name="description" type="text" placeholder="Description" value={form.description} onChange={handleChange} />
            <input name="date" type="date" value={form.date} onChange={handleChange} />
            <button type="submit">Add Expense</button>
            <button type="button" onClick={handleSave} className="save-button">Save All</button>
            <button type="button" onClick={handleClearAll}>Clear All</button>
          </form>

          <div className="chart-pair">
            <div className="chart-container">
              <PieChart width={250} height={250}>
                <Pie data={unspentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {unspentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </div>
            <div className="chart-container">
              <PieChart width={250} height={250}>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-cat-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </div>
          </div>

          <h2>Total: €{total.toFixed(2)}</h2>
          <ul className="expense-list">
            {expenses.map((exp) => (
              <li key={exp.id} className="expense-item">
                <strong>€{exp.amount.toFixed(2)}</strong> — {exp.category} — {exp.description || 'No description'} — {exp.date}
                <button onClick={() => handleDelete(exp.id)}>🗑️</button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h2>Saved Snapshots</h2>
          {saves.length === 0 ? <p>No saves yet.</p> : saves.map(save => {
            const pieData = [
              { name: 'Spent', value: save.totalSpent },
              { name: 'Unspent', value: save.budget - save.totalSpent }
            ];

            const catTotals = save.expenses.reduce((acc, curr) => {
              acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
              return acc;
            }, {});
            const pieCategories = Object.entries(catTotals).map(([name, value]) => ({ name, value }));

            return (
              <div key={save.id} className="save-entry">
                <h3>{save.timestamp}</h3>
                <p><strong>Wallet:</strong> {save.wallet}</p>
                <p><strong>Budget:</strong> €{save.budget}</p>
                <p><strong>Spent:</strong> €{save.totalSpent}</p>
                <div className="chart-pair">
                  <div className="chart-container">
                    <PieChart width={250} height={250}>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {pieData.map((entry, index) => (
                          <Cell key={`spent-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </div>
                  <div className="chart-container">
                    <PieChart width={250} height={250}>
                      <Pie data={pieCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {pieCategories.map((entry, index) => (
                          <Cell key={`cat-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </div>
                </div>
              </div>
            );
          })}
          <button onClick={clearSaves}>Clear All Saves</button>
        </>
      )}
    </div>
  );
};







export default App;
