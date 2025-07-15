const axios = require('axios');
const httpMocks = require('node-mocks-http');

jest.mock('axios');

describe('axios in webhookController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should make successful HTTP request', async () => {
    const mockResponse = { data: { success: true } };
    axios.get.mockResolvedValue(mockResponse);  // Aquí mockeas axios.get
    
    const response = await axios.get('https://api.test.com');
    expect(response).toEqual(mockResponse);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  test('should handle network errors', async () => {
    const networkError = new Error('Network Error');
    axios.get.mockRejectedValue(networkError);  // Aquí también axios.get

    await expect(axios.get('https://api.test.com')).rejects.toThrow('Network Error');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  test('should handle timeout errors', async () => {
    const timeoutError = new Error('timeout of 5000ms exceeded');
    axios.get.mockRejectedValue(timeoutError);

    await expect(axios.get('https://api.test.com')).rejects.toThrow('timeout');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  test('should handle invalid URL', async () => {
    const invalidUrlError = new Error('Invalid URL');
    axios.get.mockRejectedValue(invalidUrlError);

    await expect(axios.get('invalid-url')).rejects.toThrow('Invalid URL');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  test('should make POST request with correct data', async () => {
    const mockData = { key: 'value' };
    const mockResponse = { data: { success: true } };
    axios.post.mockResolvedValue(mockResponse);

    const response = await axios.post('https://api.test.com', mockData);
    expect(response).toEqual(mockResponse);
    expect(axios.post).toHaveBeenCalledWith('https://api.test.com', mockData);
  });
});
