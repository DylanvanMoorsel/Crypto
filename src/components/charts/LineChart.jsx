import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

// lijn grafiek van de prijsgeschiedenis
function LineChart({ color, history }) {
  // verwijzing naar het canvas element waar de grafiek op komt
  const canvasRef = useRef(null);
  // de grafiek zelf opslaan zodat we hem later kunnen verwijderen
  const chartRef = useRef(null);

  // grafiek opnieuw tekenen als de history verandert
  useEffect(() => {
    // minimaal 2 punten nodig voor een lijn
    if (history.length < 2) {
      return;
    }

    // oude grafiek verwijderen anders stapelen ze op
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // labels voor de x-as (1, 2, 3, ...)
    const labels = [];
    for (let i = 0; i < history.length; i++) {
      labels.push(i + 1);
    }

    // nieuwe grafiek aanmaken
    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          backgroundColor: color + "33",
          borderColor: color,
          data: history,
          tension: 0.4,
          pointRadius: 3,
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: {
            ticks: { color: "#aaa", callback: (val) => "€" + val.toLocaleString("nl-NL") },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
        },
      },
    });

    // grafiek opruimen als het component verdwijnt
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [history]);

  return <canvas ref={canvasRef} height={80} />;
}

export default LineChart;
