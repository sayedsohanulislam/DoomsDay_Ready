const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Something went wrong');
    error.code = data?.error?.code || 'UNKNOWN_ERROR';
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  // Movies
  getMovies: () => request('/movies'),
  createMovie: (movie) => request('/movies', { method: 'POST', body: JSON.stringify(movie) }),
  updateMovie: (id, updates) => request(`/movies/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteMovie: (id) => request(`/movies/${id}`, { method: 'DELETE' }),
  getRewatchOrder: (id) => request(`/movies/${id}/rewatch-order`),
  resetSeed: () => request('/movies/reset-seed', { method: 'POST' }),

  // Cinemas
  getCinemas: () => request('/cinemas'),
  createCinema: (cinema) => request('/cinemas', { method: 'POST', body: JSON.stringify(cinema) }),
  getBooking: (id, groupSize) => request(`/cinemas/${id}/booking?groupSize=${groupSize}`),
};
