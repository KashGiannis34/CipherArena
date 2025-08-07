<script>
  import { onMount } from 'svelte';
  import {
    Chart,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  
  Chart.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  let { solveTimes = [], cipherType = 'All' } = $props();

  let chart, canvasEl;

  function getHistogramBuckets(times) {
    if (!times.length) return { labels: [], data: [] };

    const max = Math.max(...times);
    const min = Math.min(...times);
    const binCount = Math.min(15, Math.ceil(Math.sqrt(times.length)));
    const binSize = (max - min) / binCount || 0.1;

    const buckets = Array(binCount).fill(0);
    for (let time of times) {
      const idx = Math.min(Math.floor((time - min) / binSize), binCount - 1);
      buckets[idx]++;
    }

    return {
      labels: buckets.map((_, i) => {
        const start = (min + i * binSize).toFixed(2);
        const end = (min + (i + 1) * binSize).toFixed(2);
        return `${start}s–${end}s`;
      }),
      data: buckets
    };
  }

  function renderChart() {
    if (chart) chart.destroy();

    const { labels, data } = getHistogramBuckets(solveTimes);

    chart = new Chart(canvasEl, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: `Solve Time Per Character Distribution`,
          data,
          backgroundColor: 'rgba(188, 174, 255, 0.7)',
          borderColor: 'rgba(188, 174, 255, 1)',
          borderWidth: 1,
          borderRadius: 8,
          barPercentage: 1.0,
          categoryPercentage: 1.0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              title: () => '',
              label: context => {
                const count = context.raw;
                const range = context.label;
                const noun = count === 1 ? 'Cipher' : 'Ciphers';
                return `${count} ${noun} Solved in ${range}`;
              }
            },
            backgroundColor: '#1e1e2f',
            borderColor: '#bcaeff',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 8,
            displayColors: false,
            titleFont: { family: 'Rubik', size: 13, weight: 'bold' },
            bodyFont: { family: 'Rubik', size: 13 },
            titleColor: '#ffffff',
            bodyColor: '#e0e0ff',
            yAlign: 'top',
            xAlign: 'center',
            caretSize: 0,
            caretPadding: 0
          },
          title: {
            display: true,
            text: `Solve Time Per Character Histogram (${cipherType})`,
            color: '#e5e5ff',
            font: {
              family: 'Rubik',
              size: 16,
              weight: 'bold'
            },
            padding: { top: 10, bottom: 10 }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Solve Time Per Character Range (s)',
              color: '#ccccff',
              font: { family: 'Rubik', size: 13, weight: '500' }
            },
            ticks: {
              color: '#d0d0ff',
              font: { family: 'Rubik', size: 12 }
            },
            grid: {
              color: 'rgba(255,255,255,0.05)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Frequency',
              color: '#ccccff',
              font: { family: 'Rubik', size: 13, weight: '500' }
            },
            beginAtZero: true,
            ticks: {
              color: '#d0d0ff',
              font: { family: 'Rubik', size: 12 },
              stepSize: 1
            },
            grid: {
              color: 'rgba(255,255,255,0.05)'
            }
          }
        }
      }
    });
  }

  $effect(() => {
    if (canvasEl && solveTimes.length) renderChart();
  });

  onMount(() => {
    if (solveTimes.length) renderChart();
  });
</script>

<div class="solve-time-graph-container">
  <canvas bind:this={canvasEl}></canvas>
</div>

<style>
  .solve-time-graph-container {
    max-width: 600px;
    height: 250px;
    margin: 2rem auto;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    position: relative;
  }

  canvas {
    width: 100% !important;
    height: 100% !important;
    font-family: 'Rubik', sans-serif !important;
  }
</style>