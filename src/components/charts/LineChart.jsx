import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

// tekent een lijngrafiek van de prijsgeschiedenis van 1 coin
// color = kleur van de lijn, history = array met prijzen
function LineChart({ color, history }) {
  // useRef = verwijzing naar een DOM-element of waarde die niet hertekent bij wijziging
  const canvasRef = useRef(null); // verwijst naar het canvas-element in de HTML
  const chartRef = useRef(null);  // bewaart de Chart.js instantie zodat we hem kunnen verwijderen

  // useEffect: de grafiek opnieuw tekenen als de history verandert
  // [history] als afhankelijkheid = useEffect draait opnieuw elke keer dat history verandert
  useEffect(() => {
    // minimaal 2 punten nodig om een lijn te kunnen tekenen
    if (history.length < 2) {
      return;
    }

    // oude grafiek verwijderen, anders stapelen ze op het canvas
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // labels voor de x-as: 1, 2, 3, ... (positie in de geschiedenis)
    const labels = [];
    for (let i = 0; i < history.length; i++) {
      labels.push(i + 1);
    }

    // nieuwe Chart.js grafiek aanmaken op het canvas
    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          backgroundColor: color + "33", // kleur + "33" = transparante achtergrond
          borderColor: color,
          data: history,
          tension: 0.4,   // vloeiende lijn
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

    // cleanup: grafiek verwijderen als het component verdwijnt (voorkomt geheugenlek)
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [history]);

  return <canvas ref={canvasRef} height={80} />;
}

export default LineChart;
