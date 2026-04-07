import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

// taart diagram van de top 10 coins op marktwaarde
function PieChart({ allCoins }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    // stoppen als er nog geen data is
    if (allCoins.length === 0) {
      return;
    }

    // oude grafiek verwijderen
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const namen = [];
    const waarden = [];
    const kleuren = ["#f7931a", "#627eea", "#9945ff", "#00d4aa", "#e84142", "#2775ca", "#f0b90b", "#e6007a", "#16c784", "#ff6b35"];

    // eerste 10 coins pakken
    for (let i = 0; i < 10; i++) {
      namen.push(allCoins[i].name);
      waarden.push(allCoins[i].market_cap);
    }

    // grafiek aanmaken
    chartRef.current = new Chart(canvasRef.current, {
      type: "pie",
      data: {
        labels: namen,
        datasets: [{ backgroundColor: kleuren, data: waarden }],
      },
      options: {
        plugins: {
          title: { display: true, text: "Marktaandeel top 10 coins", color: "#ffffff", font: { size: 16 } },
          legend: { labels: { color: "#ffffff" } },
          // tooltip netjes opmaken
          tooltip: {
            callbacks: {
              label: (item) => {
                const waarde = item.raw;
                return " €" + waarde.toLocaleString("nl-NL", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
              }
            }
          }
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [allCoins]);

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 mt-5 max-w-sm mx-auto">
      <canvas ref={canvasRef} />
    </div>
  );
}

export default PieChart;
