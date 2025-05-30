export function truncate(str: string, max: number, middle = false): string {
  if (str.length <= max) return str;
  if (max < 4) return str.slice(0, max); // Not enough space for ellipsis

  if (!middle) {
    return str.slice(0, max - 3) + "...";
  }

  const half = Math.floor((max - 3) / 2);
  const end = max - 3 - half;
  return str.slice(0, half) + "..." + str.slice(str.length - end);
}
