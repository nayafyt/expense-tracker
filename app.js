// --- State ---
let currentMonth = '';

// --- Helpers ---
function getStorageKey(month) {
    return `expenses_${month}`;
}

function getSalaryKey(month) {
    return `salary_${month}`;
}

function getData(month) {
    const raw = localStorage.getItem(getStorageKey(month));
    return raw ? JSON.parse(raw) : [];
}

function saveData(month, expenses) {
    localStorage.setItem(getStorageKey(month), JSON.stringify(expenses));
}

function getSalary(month) {
    return parseFloat(localStorage.getItem(getSalaryKey(month))) || 0;
}

function saveSalary(month, amount) {
    localStorage.setItem(getSalaryKey(month), amount.toString());
}

function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

// --- Month Picker ---
function initMonthPicker() {
    const picker = document.getElementById('monthPicker');
    const now = new Date();
    currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
    picker.value = currentMonth;
    picker.addEventListener('change', function () {
        currentMonth = this.value;
        render();
    });
}

// --- Salary ---
function setSalary() {
    const input = document.getElementById('salaryInput');
    const amount = parseFloat(input.value);
    if (!amount || amount <= 0) return;
    saveSalary(currentMonth, amount);
    input.value = '';
    render();
}

function editSalary() {
    const salary = getSalary(currentMonth);
    document.getElementById('salaryInput').value = salary;
    document.getElementById('salaryDisplay').classList.add('hidden');
    document.getElementById('salaryForm').classList.remove('hidden');
}

// --- Expenses ---
function addExpense(e) {
    e.preventDefault();
    const desc = document.getElementById('expenseDesc').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    const date = document.getElementById('expenseDate').value;

    if (!desc || !amount || !category || !date) return;

    const expenses = getData(currentMonth);
    expenses.push({
        id: Date.now(),
        description: desc,
        amount: amount,
        category: category,
        date: date
    });
    saveData(currentMonth, expenses);

    // Reset form
    document.getElementById('expenseForm').reset();
    // Set date back to today
    document.getElementById('expenseDate').value = new Date().toISOString().slice(0, 10);

    render();
}

function deleteExpense(id) {
    let expenses = getData(currentMonth);
    expenses = expenses.filter(exp => exp.id !== id);
    saveData(currentMonth, expenses);
    render();
}

// --- CSV ---
function downloadCSV() {
    const expenses = getData(currentMonth);
    const salary = getSalary(currentMonth);
    if (expenses.length === 0) return;

    // Sort by date
    expenses.sort((a, b) => a.date.localeCompare(b.date));

    let runningTotal = 0;
    const categoryTotals = {};

    let csv = 'Date,Description,Category,Amount,Running Total,Remaining from Salary\n';

    expenses.forEach(exp => {
        runningTotal += exp.amount;
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
        const remaining = salary - runningTotal;
        csv += `"${exp.date}","${exp.description}","${exp.category}",${exp.amount.toFixed(2)},${runningTotal.toFixed(2)},${remaining.toFixed(2)}\n`;
    });

    // Add category summary
    csv += '\nCategory Summary\n';
    csv += 'Category,Total\n';
    Object.keys(categoryTotals).sort().forEach(cat => {
        csv += `"${cat}",${categoryTotals[cat].toFixed(2)}\n`;
    });

    csv += `\nSalary,${salary.toFixed(2)}\n`;
    csv += `Total Expenses,${runningTotal.toFixed(2)}\n`;
    csv += `Remaining,${(salary - runningTotal).toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${currentMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// --- Render ---
function render() {
    const salary = getSalary(currentMonth);
    const expenses = getData(currentMonth);

    // Salary section
    if (salary > 0) {
        document.getElementById('salaryDisplay').classList.remove('hidden');
        document.getElementById('salaryForm').classList.add('hidden');
        document.getElementById('salaryAmount').textContent = formatCurrency(salary);
    } else {
        document.getElementById('salaryDisplay').classList.add('hidden');
        document.getElementById('salaryForm').classList.remove('hidden');
    }

    // Sort expenses by date
    expenses.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate totals
    let totalExpenses = 0;
    const categoryTotals = {};

    expenses.forEach(exp => {
        totalExpenses += exp.amount;
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const remaining = salary - totalExpenses;

    // Summary
    document.getElementById('summarySalary').textContent = formatCurrency(salary);
    document.getElementById('summaryExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('summaryRemaining').textContent = formatCurrency(remaining);

    const remainingEl = document.querySelector('.summary-item.remaining');
    if (remaining < 0) {
        remainingEl.classList.add('negative');
    } else {
        remainingEl.classList.remove('negative');
    }

    // Category breakdown
    const catContainer = document.getElementById('categoryBreakdown');
    const categories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    if (categories.length === 0) {
        catContainer.innerHTML = '<div class="empty-state">No categories yet</div>';
    } else {
        catContainer.innerHTML = categories.map(([cat, total]) => {
            const percentage = totalExpenses > 0 ? (total / totalExpenses * 100) : 0;
            return `
                <div class="category-item">
                    <div>
                        <span class="cat-name">${cat}</span>
                        <div class="category-bar" style="width:120px">
                            <div class="category-bar-fill" style="width:${percentage}%"></div>
                        </div>
                    </div>
                    <span class="cat-amount">${formatCurrency(total)}</span>
                </div>
            `;
        }).join('');
    }

    // Expenses list
    const listContainer = document.getElementById('expensesList');
    const noExpenses = document.getElementById('noExpenses');

    if (expenses.length === 0) {
        listContainer.innerHTML = '';
        noExpenses.classList.remove('hidden');
    } else {
        noExpenses.classList.add('hidden');
        let runningTotal = 0;
        listContainer.innerHTML = expenses.map(exp => {
            runningTotal += exp.amount;
            return `
                <div class="expense-item">
                    <div class="expense-info">
                        <div class="expense-desc">${exp.description}</div>
                        <div class="expense-meta">${exp.category} &middot; ${exp.date}</div>
                    </div>
                    <div class="expense-running-total">
                        <div class="expense-amount">-${formatCurrency(exp.amount)}</div>
                        <div>Total: ${formatCurrency(runningTotal)}</div>
                    </div>
                    <button class="btn btn-danger" onclick="deleteExpense(${exp.id})">&#10005;</button>
                </div>
            `;
        }).join('');
    }

    // Set default date for expense form
    const dateInput = document.getElementById('expenseDate');
    if (!dateInput.value) {
        dateInput.value = new Date().toISOString().slice(0, 10);
    }
}

// --- Init ---
document.addEventListener('DOMContentLoaded', function () {
    initMonthPicker();
    render();
});
