function normalizeSeed(seed: number): number {
  const value = Math.abs(Math.trunc(seed));
  return value === 0 ? 1 : value;
}

function seededUnit(seed: number, offset = 0): number {
  const normalized = normalizeSeed(seed + offset);
  const raw = Math.sin(normalized * 12.9898 + 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

export function organicBorderRadius(seed: number, base = 16, variance = 4): string {
  const topLeft = base + (seededUnit(seed, 1) - 0.5) * variance * 2;
  const topRight = base + (seededUnit(seed, 2) - 0.5) * variance * 2;
  const bottomRight = base + (seededUnit(seed, 3) - 0.5) * variance * 2;
  const bottomLeft = base + (seededUnit(seed, 4) - 0.5) * variance * 2;

  return `${topLeft.toFixed(1)}px ${topRight.toFixed(1)}px ${bottomRight.toFixed(1)}px ${bottomLeft.toFixed(1)}px`;
}

export function randomDelay(seed: number, maxDelay = 0.2): number {
  return Number((seededUnit(seed, 5) * maxDelay).toFixed(3));
}

export function randomRotation(seed: number, maxDegrees = 2): string {
  const rotation = (seededUnit(seed, 6) - 0.5) * maxDegrees * 2;
  return `rotate(${rotation.toFixed(2)}deg)`;
}
