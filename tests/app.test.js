const request = require('supertest');
const app = require('../app'); // Import the Express app

describe('GET /users', () => {
  it('should return a list of users and a 200 status code', async () => {
    const response = await request(app).get('/users');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      { name: 'John Doe', email: 'john@example.com' }
    ]);
  });
});

describe('GET /invalid-route', () => {
    it('should return 404 for an invalid route', async () => {
      const response = await request(app).get('/invalid-route');
      expect(response.statusCode).toBe(404);
    });
  });
  
