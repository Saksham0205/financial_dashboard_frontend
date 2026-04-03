const HEALTH_URL = "https://finance-dashboard-backend-sigv.onrender.com/health";
const INTERVAL = 10 * 60 * 1000; // 10 minutes

let started = false;

export function startKeepAlive() {
  if (started) return;
  started = true;

  const ping = () => {
    fetch(HEALTH_URL).catch(() => {});
  };

  ping();
  setInterval(ping, INTERVAL);
}
