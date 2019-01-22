export function generateRandomNum() {
  return Date.now().toString() + ("" + Math.random()).substring(2, 5);
}
