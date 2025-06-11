const appSec = document.getElementById("application-section");
const balSec = document.getElementById("balance-section");
const ttlInc = document.getElementById("incb");
const ttlExp = document.getElementById("ttlexpb");
const netSav = document.getElementById("netsvgb");
const calSec = document.getElementById("calc-section");
const incBtn = document.getElementById("incbtn");
const expBtn = document.getElementById("expbtn");
const amtFld = document.getElementById("amtfld");
const desFld = document.getElementById("desfld");
const fltrSec = document.getElementById("filter-section");
const dynBtn = document.getElementById("dyn-btn");
const tnxSec = document.getElementById("tnx-section");

let currentBalance = 0;
let totalIncome = 0;
let totalExpense = 0;
let transactions = [];

// Load data from localStorage
window.addEventListener("load", () => {
  const savedData = JSON.parse(localStorage.getItem("trackerData"));
  if (savedData) {
    currentBalance = savedData.currentBalance;
    totalIncome = savedData.totalIncome;
    totalExpense = savedData.totalExpense;
    transactions = savedData.transactions || [];
    transactions.forEach(t => renderTransaction(t));
    updateDisplay();
  }
});

function saveToLocalStorage() {
  localStorage.setItem("trackerData", JSON.stringify({
    currentBalance,
    totalIncome,
    totalExpense,
    transactions
  }));
}

incBtn.addEventListener('click', () => {
  addIncome();
});

expBtn.addEventListener('click', () => {
  addExpense();
});

function updateDisplay() {
  ttlInc.textContent = `Income: $${totalIncome.toFixed(2)}`;
  ttlExp.textContent = `Expense: $${totalExpense.toFixed(2)}`;
  netSav.textContent = `Net Savings: $${currentBalance.toFixed(2)}`;
  saveToLocalStorage();
}

function renderTransaction({ type, amount, description }) {
  const tnx = document.createElement("div");
  tnx.className = type;
  tnx.style.borderLeft = type === "income" ? "10px solid green" : "10px solid red";
  tnx.style.backgroundColor = type === "income" ? "#e6ffed" : "#ffe6e6";
  tnx.dataset.amount = amount;
  tnx.dataset.description = description;
  tnx.dataset.type = type;

  const content = document.createElement("div");
  content.innerHTML = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${type === "income" ? "$" : "-$"}${amount} <br> Description: ${description}`;

  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";
  editBtn.className = "edit-btn";
  editBtn.style.marginLeft = "10px";
  editBtn.style.cursor = "pointer";

  editBtn.addEventListener("click", () => {
    const newAmount = parseFloat(prompt("Edit amount:", amount));
    const newDesc = prompt("Edit description:", description);

    if (newAmount && newDesc) {
      if (type === "income") {
        totalIncome -= parseFloat(tnx.dataset.amount);
        currentBalance -= parseFloat(tnx.dataset.amount);
        totalIncome += newAmount;
        currentBalance += newAmount;
      } else {
        totalExpense -= parseFloat(tnx.dataset.amount);
        currentBalance += parseFloat(tnx.dataset.amount);
        totalExpense += newAmount;
        currentBalance -= newAmount;
      }

      tnx.dataset.amount = newAmount;
      tnx.dataset.description = newDesc;
      content.innerHTML = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${type === "income" ? "$" : "-$"}${newAmount} <br> Description: ${newDesc}`;
      updateTransactionInMemory(tnx.dataset.amount, newAmount, newDesc, type);
      updateDisplay();
    }
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.className = "delete-btn";
  deleteBtn.style.marginLeft = "5px";
  deleteBtn.style.cursor = "pointer";

  deleteBtn.addEventListener("click", () => {
    if (type === "income") {
      totalIncome -= parseFloat(tnx.dataset.amount);
      currentBalance -= parseFloat(tnx.dataset.amount);
    } else {
      totalExpense -= parseFloat(tnx.dataset.amount);
      currentBalance += parseFloat(tnx.dataset.amount);
    }
    transactions = transactions.filter(t => !(t.amount == tnx.dataset.amount && t.description == tnx.dataset.description && t.type === tnx.dataset.type));
    tnx.remove();
    updateDisplay();
  });

  tnx.appendChild(content);
  tnx.appendChild(editBtn);
  tnx.appendChild(deleteBtn);
  tnxSec.prepend(tnx);
}

function updateTransactionInMemory(oldAmount, newAmount, newDesc, type) {
  const index = transactions.findIndex(t => t.amount == oldAmount && t.type === type);
  if (index !== -1) {
    transactions[index].amount = newAmount;
    transactions[index].description = newDesc;
  }
}

function addIncome() {
  const IncomeAmount = parseFloat(amtFld.value);
  const description = desFld.value;

  if (IncomeAmount && description) {
    totalIncome += IncomeAmount;
    currentBalance += IncomeAmount;
    transactions.push({ type: "income", amount: IncomeAmount, description });
    renderTransaction({ type: "income", amount: IncomeAmount, description });
    updateDisplay();
    amtFld.value = "";
    desFld.value = "";
  } else {
    alert("Please enter both amount and description.");
  }
}

function addExpense() {
  const expenseAmount = parseFloat(amtFld.value);
  const description = desFld.value;

  if (expenseAmount && description) {
    totalExpense += expenseAmount;
    currentBalance -= expenseAmount;
    transactions.push({ type: "expense", amount: expenseAmount, description });
    renderTransaction({ type: "expense", amount: expenseAmount, description });
    updateDisplay();
    amtFld.value = "";
    desFld.value = "";
  } else {
    alert("Please enter both amount and description.");
  }
}

fltrSec.addEventListener("change", (e) => {
  const filter = e.target.value;
  const transactionElements = tnxSec.children;

  for (let tnx of transactionElements) {
    if (filter === "all") {
      tnx.style.display = "block";
    } else if (filter === "income") {
      tnx.style.display = tnx.classList.contains("income") ? "block" : "none";
    } else if (filter === "expense") {
      tnx.style.display = tnx.classList.contains("expense") ? "block" : "none";
    }
  }
});
