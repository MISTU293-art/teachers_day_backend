document.addEventListener('DOMContentLoaded', async () => {
  const yearChartCanvas = document.getElementById('yearCollectionChart');
  const methodChartCanvas = document.getElementById('methodCollectionChart');
  const categoryChartCanvas = document.getElementById('categoryExpenseChart');

  if (!yearChartCanvas && !methodChartCanvas && !categoryChartCanvas) {
    return;
  }

  try {
    const res = await fetch('/dashboard/analytics');
    const json = await res.json();

    if (!json.success || !json.data) return;
    const { yearWiseCollections, paymentMethodCollections, expenseByCategory } = json.data;

    // 1. Year-wise Collection Chart
    if (yearChartCanvas) {
      const yearLabels = yearWiseCollections.map(item => item._id || 'Unknown');
      const yearAmounts = yearWiseCollections.map(item => item.totalAmount || 0);

      new Chart(yearChartCanvas, {
        type: 'bar',
        data: {
          labels: yearLabels.length ? yearLabels : ['No Data'],
          datasets: [{
            label: 'Collection Amount (₹)',
            data: yearAmounts.length ? yearAmounts : [0],
            backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#1e293b' },
              ticks: { color: '#94a3b8' }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8' }
            }
          }
        }
      });
    }

    // 2. Payment Method Distribution Chart
    if (methodChartCanvas) {
      const methodLabels = paymentMethodCollections.map(item => item._id || 'Unknown');
      const methodAmounts = paymentMethodCollections.map(item => item.totalAmount || 0);

      new Chart(methodChartCanvas, {
        type: 'doughnut',
        data: {
          labels: methodLabels.length ? methodLabels : ['None'],
          datasets: [{
            data: methodAmounts.length ? methodAmounts : [1],
            backgroundColor: ['#22c55e', '#38bdf8', '#f59e0b'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#94a3b8', boxWidth: 12, padding: 15 }
            }
          }
        }
      });
    }

    // 3. Expense Categories Chart
    if (categoryChartCanvas) {
      const catLabels = expenseByCategory.map(item => item._id || 'General');
      const catAmounts = expenseByCategory.map(item => item.totalAmount || 0);

      new Chart(categoryChartCanvas, {
        type: 'polarArea',
        data: {
          labels: catLabels.length ? catLabels : ['None'],
          datasets: [{
            data: catAmounts.length ? catAmounts : [0],
            backgroundColor: [
              'rgba(239, 68, 68, 0.7)',
              'rgba(234, 179, 8, 0.7)',
              'rgba(59, 130, 246, 0.7)',
              'rgba(168, 85, 247, 0.7)',
              'rgba(20, 184, 166, 0.7)'
            ],
            borderWidth: 1,
            borderColor: '#111827'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#94a3b8', boxWidth: 10, padding: 12 }
            }
          },
          scales: {
            r: {
              grid: { color: '#1e293b' },
              ticks: { display: false }
            }
          }
        }
      });
    }
  } catch (err) {
    console.error('Failed to load chart analytics:', err);
  }
});
