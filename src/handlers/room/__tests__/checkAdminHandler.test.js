const httpMocks = require('node-mocks-http');
const checkAdminHandler = require('../checkAdminHandler');

describe('checkAdminHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return isAdmin true when user has admin role', () => {
    const req = httpMocks.createRequest({
      user: {
        'http://aremar/roles': ['admin', 'user']
      }
    });
    const res = httpMocks.createResponse();

    checkAdminHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ isAdmin: true });
  });

  test('should return isAdmin false when user has no admin role', () => {
    const req = httpMocks.createRequest({
      user: {
        'http://aremar/roles': ['user']
      }
    });
    const res = httpMocks.createResponse();

    checkAdminHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ isAdmin: false });
  });

  test('should return isAdmin false when roles array is empty', () => {
    const req = httpMocks.createRequest({
      user: {
        'http://aremar/roles': []
      }
    });
    const res = httpMocks.createResponse();

    checkAdminHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ isAdmin: false });
  });

  test('should return isAdmin false when roles property does not exist', () => {
    const req = httpMocks.createRequest({
      user: {}
    });
    const res = httpMocks.createResponse();

    checkAdminHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ isAdmin: false });
  });

  test('should return isAdmin false when user is null', () => {
    const req = httpMocks.createRequest({
      user: null
    });
    const res = httpMocks.createResponse();

    checkAdminHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ isAdmin: false });
  });

  test('should return isAdmin false when user is undefined', () => {
    const req = httpMocks.createRequest({});
    const res = httpMocks.createResponse();

    checkAdminHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ isAdmin: false });
  });
});
