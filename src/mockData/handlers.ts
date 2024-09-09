import { http, HttpResponse } from 'msw';

export const handlers = [
  // GET /api/data - Retrieve the cards data from localStorage
  http.get('/api/data', ({ request }) => {
    const data = JSON.parse(localStorage.getItem('cards') || '[]');
    return new HttpResponse(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
  }),

  // POST /api/data - Store the cards data to localStorage
  http.post('/api/data', async ({ request }) => {
    const data = await request.json();  // Get the body content from the request
    localStorage.setItem('cards', JSON.stringify(data));

    return new HttpResponse(null, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
  })
];
