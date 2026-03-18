import { useState, useEffect } from "react";

const API_URL = "/api/v3/simple/price?ids=bitcoin&vs_currencies=eur&x_cg_demo_api_key=CG-GELfdWVmVWAYUrdgU4pXoGfk";

function haalPrijsOp(setPrijs) {
  fetch(API_URL)
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      setPrijs(data.bitcoin.eur);
    });
}

function formateerPrijs(prijs) {
  return "€" + prijs;
}

function Titel() {
  return <h1>bitcoin prijs checker</h1>;
}

function PrijsWeergave({ prijs }) {
  const tekst = formateerPrijs(prijs);
  return <p>prijs: {tekst}</p>;
}

function App() {
  const [prijs, setPrijs] = useState("laden...");

  useEffect(function() {
    haalPrijsOp(setPrijs);

    const interval = setInterval(function() {
      haalPrijsOp(setPrijs);
    }, 10000);

    return function() {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <Titel />
      <PrijsWeergave prijs={prijs} />
    </div>
  );
}

export default App;