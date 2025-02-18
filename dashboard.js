document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  const filterType = document.getElementById('filter-type');
  const filterDate = document.getElementById('filter-date');
  const applyFiltersButton = document.getElementById('apply-filters');
  const transactionDetails = document.getElementById('transaction-details');

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
      renderCharts(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }

  applyFiltersButton.addEventListener('click', async () => {
    const type = filterType.value;
    const date = filterDate.value;
    const url = `https://momo-analysis-bn.onrender.com/api/transactions?type=${type}&date=${date}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const filteredTransactions = data.map((transaction) => ({
        ...transaction,
        amount: `${transaction.amount} RWF`,
      }));
      renderCharts(filteredTransactions);
    } catch (error) {
      console.error('Error fetching filtered transactions:', error);
    }
  });

  function renderCharts(data) {
    const transactionTypes = data.reduce((acc, transaction) => {
      const amount = parseFloat(transaction.amount);
      acc[transaction.transaction_type] =
        (acc[transaction.transaction_type] || 0) + amount;
      return acc;
    }, {});

    const monthlySummaries = data.reduce((acc, transaction) => {
      const month = new Date(transaction.date).toLocaleString('default', {
        month: 'long',
      });
      const amount = parseFloat(transaction.amount);
      acc[month] = (acc[month] || 0) + amount;
      return acc;
    }, {});

    const transactionTypeChart = new Chart(
      document.getElementById('transactionTypeChart'),
      {
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
              title: {
                display: true,
                text: 'Amount (RWF)',
              },
            },
          },
        },
      },
    );

    const monthlySummaryChart = new Chart(
      document.getElementById('monthlySummaryChart'),
      {
        type: 'line',
        data: {
          labels: Object.keys(monthlySummaries),
          datasets: [
            {
              label: 'Monthly Summaries (RWF)',
              data: Object.values(monthlySummaries),
              borderColor: '#4bc0c0',
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Amount (RWF)',
              },
            },
          },
        },
      },
    );

    const paymentDistributionChart = new Chart(
      document.getElementById('paymentDistributionChart'),
      {
        type: 'pie',
        data: {
          labels: Object.keys(transactionTypes),
          datasets: [
            {
              label: 'Payment Distribution (RWF)',
              data: Object.values(transactionTypes),
              backgroundColor: ['#36a2eb', '#ff6384'],
            },
          ],
        },
      },
    );
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
