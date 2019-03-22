export function generateRandomNum() {
  return Date.now().toString() + ("" + Math.random()).substring(2, 5);
}

export function generateSessionId() {
  return (
    Date.now()
      .toString()
      .substring() + ("" + Math.random()).substring(2, 7)
  );
}

export function millisToHMS(s) {
  function pad(n, z) {
    z = z || 2;
    return ("00" + n).slice(-z);
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return pad(hrs) + ":" + pad(mins) + ":" + pad(secs);
}
