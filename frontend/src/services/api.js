const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `请求失败：${response.status}`);
  }

  return response.json();
}

export function fetchAccidents() {
  return request('/accidents');
}

export function fetchAccident(id) {
  return request(`/accidents/${id}`);
}

export function submitReport(payload) {
  return request('/submit-report', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
