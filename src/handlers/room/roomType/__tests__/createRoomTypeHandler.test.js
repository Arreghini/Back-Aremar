jest.mock('../../../../controllers/image/uploadImageController', () => jest.fn());
jest.mock('../../../../controllers/room/roomType/createRoomTypeController', () => ({
  createRoomTypeController: jest.fn(),
}));

const uploadImageController = require('../../../../controllers/image/uploadImageController');
const { createRoomTypeController } = require('../../../../controllers/room/roomType/createRoomTypeController');
const createRoomTypeHandler = require('../createRoomTypeHandler');

describe('createRoomTypeHandler', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('debe devolver 400 si falta el nombre', async () => {
    mockReq = { body: { name: '' }, files: [] };

    await createRoomTypeHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'El nombre del tipo de habitación es requerido',
    });
  });

  it('debe manejar existingPhotos válido y crear tipo de habitación', async () => {
    const fakePhotos = ['url1', 'url2'];
    mockReq = {
      body: {
        name: 'Suite',
        existingPhotos: JSON.stringify(fakePhotos),
      },
      files: [],
    };
    createRoomTypeController.mockResolvedValue({ id: 1, name: 'Suite', photos: fakePhotos });

    await createRoomTypeHandler(mockReq, mockRes);

    expect(createRoomTypeController).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Suite',
      photos: fakePhotos,
    }));
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({ name: 'Suite' }),
      message: 'Tipo de habitación creado exitosamente',
    }));
  });

  it('debe manejar error al parsear existingPhotos y continuar', async () => {
    mockReq = {
      body: {
        name: 'Suite',
        existingPhotos: 'cadena no JSON',
      },
      files: [],
    };
    createRoomTypeController.mockResolvedValue({ id: 1, name: 'Suite', photos: [] });

    await createRoomTypeHandler(mockReq, mockRes);

    expect(createRoomTypeController).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Suite',
      photos: [],
    }));
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('debe subir nuevas imágenes y agregarlas a photos', async () => {
    mockReq = {
      body: {
        name: 'Suite',
        existingPhotos: JSON.stringify(['url1']),
      },
      files: [{ originalname: 'img1.jpg' }, { originalname: 'img2.jpg' }],
    };

    uploadImageController
      .mockResolvedValueOnce({ secure_url: 'url2' })
      .mockResolvedValueOnce({ secure_url: 'url3' });

    createRoomTypeController.mockResolvedValue({ id: 1, name: 'Suite', photos: ['url1', 'url2', 'url3'] });

    await createRoomTypeHandler(mockReq, mockRes);

    expect(uploadImageController).toHaveBeenCalledTimes(2);
    expect(createRoomTypeController).toHaveBeenCalledWith(expect.objectContaining({
      photos: ['url1', 'url2', 'url3'],
    }));
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('debe devolver 500 si createRoomTypeController lanza error', async () => {
    mockReq = { body: { name: 'Suite' }, files: [] };
    createRoomTypeController.mockRejectedValue(new Error('Error interno'));

    await createRoomTypeHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Error al crear el tipo de habitación',
      details: 'Error interno',
    });
  });
});
