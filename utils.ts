export function formatNumber(num: number) {
  if (num < 1000) return num.toFixed(0);

  const units = [
    "",
    "K",
    "M",
    "B",
    "T",
    "Qa",
    "Qi",
    "Sx",
    "Sp",
    "Oc",
    "No",
    "Dc",
  ];

  const k = 1000;
  const magnitude = Math.floor(Math.log(num) / Math.log(k));
  return (num / Math.pow(k, magnitude)).toFixed(2) + units[magnitude];
}

export function formatDecimal(num: number) {
  return num < 10 ? num.toFixed(1) : formatNumber(num);
}

export function createPopEffect(x: number, y: number, value: number) {
  const popElement = document.createElement("div");
  popElement.className = "pop-effect";
  popElement.textContent = `+${formatNumber(value)}`;
  popElement.style.left = `${x}px`;
  popElement.style.top = `${y}px`;

  document.body.appendChild(popElement);
  setTimeout(() => {
    document.body.removeChild(popElement);
  }, 1500);
}
