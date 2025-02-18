document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  const filterType = document.getElementById('filter-type');
  const applyFiltersButton = document.getElementById('apply-filters');
  const transactionDetails = document.getElementById('transaction-details');
  const transactionsTable = document.getElementById('transactions-table-body');
  const searchResults = document.getElementById('search-results');

  let transactions = [];

  async function fetchTransactions() {
    try {
      const response = await fetch(
        'https://momo-analysis-bn.onrender.com/api/transactions',
      );
      const fetchdata = await response.json();
      transactions = fetchdata.data.map((transaction) => ({
        ...transaction,
        amount: `${transaction.amount} RWF`,
      }));
      renderTransactionsTable(transactions);
      renderCharts(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }

  function renderCharts(data) {
    const transactionTypes = data.reduce((acc, transaction) => {
      const amount = parseFloat(transaction.amount.replace(' RWF', ''));
      acc[transaction.transaction_type] =
        (acc[transaction.transaction_type] || 0) + amount;
      return acc;
    }, {});

    const monthlySummaries = data.reduce((acc, transaction) => {
      const month = new Date(transaction.date).toLocaleString('default', {
        month: 'long',
      });
      const amount = parseFloat(transaction.amount.replace(' RWF', ''));
      acc[month] = (acc[month] || 0) + amount;
      return acc;
    }, {});

    new Chart(document.getElementById('transactionTypeChart'), {
      type: 'bar',
      data: {
        labels: Object.keys(transactionTypes),
        datasets: [
          {
            label: 'Transaction Types (RWF)',
            data: Object.values(transactionTypes),
            backgroundColor: ['#36a2eb', '#ff6384'],
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Amount (RWF)' },
          },
        },
      },
    });

    new Chart(document.getElementById('monthlySummaryChart'), {
      type: 'line',
      data: {
        labels: Object.keys(monthlySummaries),
        datasets: [
          {
            label: 'Monthly Summaries (RWF)',
            data: Object.values(monthlySummaries),
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.2)',
            pointRadius: 6,
            pointBorderWidth: 3,
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: { ticks: { color: '#000' } },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Amount (RWF)' },
          },
        },
      },
    });

    new Chart(document.getElementById('paymentDistributionChart'), {
      type: 'pie',
      data: {
        labels: Object.keys(transactionTypes),
        datasets: [
          {
            label: 'Payment Distribution (RWF)',
            data: Object.values(transactionTypes),
            backgroundColor: ['#36a2eb', '#ff6384', '#f39c12', '#9b59b6'],
          },
        ],
      },
    });
  }

  function filterTransactions() {
    const type = filterType.value.toLowerCase();
    const searchTerm = searchInput.value.toLowerCase();

    let filteredTransactions = transactions.filter((transaction) => {
      return (
        (!type || transaction.transaction_type.toLowerCase().includes(type)) &&
        (!searchTerm ||
          transaction.transaction_type.toLowerCase().includes(searchTerm) ||
          transaction.amount.toLowerCase().includes(searchTerm) ||
          transaction.date.toLowerCase().includes(searchTerm))
      );
    });

    renderTransactionsTable(filteredTransactions);
    renderCharts(filteredTransactions);
    showSearchResults(filteredTransactions);
  }

  function showSearchResults(filteredData) {
    searchResults.innerHTML = '';
    if (searchInput.value === '') {
      searchResults.style.display = 'none';
      return;
    }

    if (filteredData.length === 0) {
      searchResults.innerHTML = `<p class="no-results">No results found.</p>`;
      searchResults.style.display = 'block';
      return;
    }

    filteredData.slice(0, 5).forEach((transaction) => {
      const resultItem = document.createElement('div');
      resultItem.classList.add('search-result-item');
      resultItem.innerHTML = `
          <p><strong>${transaction.transaction_type}</strong> - ${transaction.amount}</p>
          <small>${transaction.date}</small>
        `;

      resultItem.addEventListener('click', () => {
        showTransactionDetails(transaction);
        searchResults.style.display = 'none';
      });

      searchResults.appendChild(resultItem);
    });

    searchResults.style.display = 'block';
  }

  searchInput.addEventListener('input', filterTransactions);
  applyFiltersButton.addEventListener('click', filterTransactions);

  function renderTransactionsTable(data) {
    transactionsTable.innerHTML = '';
    data.forEach((transaction) => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${transaction.id}</td>
          <td>${transaction.transaction_type}</td>
          <td>${transaction.amount}</td>
          <td>${transaction.date}</td>
        `;
      row.addEventListener('click', () => showTransactionDetails(transaction));
      transactionsTable.appendChild(row);
    });
  }

  function showTransactionDetails(transaction) {
    transactionDetails.innerHTML = `
        <p><strong>ID:</strong> ${transaction.id}</p>
        <p><strong>Type:</strong> ${transaction.transaction_type}</p>
        <p><strong>Amount:</strong> ${transaction.amount}</p>
        <p><strong>Date:</strong> ${transaction.date}</p>
      `;
  }

  fetchTransactions();
});
