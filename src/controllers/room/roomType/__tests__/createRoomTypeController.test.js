const { RoomType } = require('../../../../models');
const { createRoomTypeController } = require('../createRoomTypeController');

jest.mock('../../../../models');

describe('createRoomTypeController ampliado', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  test('crea exitosamente con fotos y loguea photosCount', async () => {
    const mockRoomType = {
      id: 1,
      name: 'Suite',
      photos: ['photo1.jpg', 'photo2.jpg'],
    };

    RoomType.create.mockResolvedValue(mockRoomType);

    const inputData = {
      name: 'Suite',
      photos: ['photo1.jpg', 'photo2.jpg'],
    };

    const result = await createRoomTypeController(inputData);

    expect(RoomType.create).toHaveBeenCalledWith(expect.objectContaining(inputData));
    expect(result).toEqual(mockRoomType);
    expect(console.log).toHaveBeenCalledWith(
      'RoomType creado:',
      expect.objectContaining({
        id: 1,
        name: 'Suite',
        photos: expect.any(Array),
        photosCount: 2,
      })
    );
  });

  test('crea exitosamente sin fotos y loguea photosCount 0', async () => {
    const mockRoomType = {
      id: 2,
      name: 'Basic',
      photos: undefined,
    };

    RoomType.create.mockResolvedValue(mockRoomType);

    const inputData = { name: 'Basic' };

    const result = await createRoomTypeController(inputData);

    expect(RoomType.create).toHaveBeenCalledWith(expect.objectContaining(inputData));
    expect(result).toEqual(mockRoomType);
    expect(console.log).toHaveBeenCalledWith(
      'RoomType creado:',
      expect.objectContaining({
        id: 2,
        name: 'Basic',
        photos: undefined,
        photosCount: 0,
      })
    );
  });

  test('crea con todos los campos posibles', async () => {
    const inputData = {
      id: 3,
      name: 'Deluxe',
      photos: ['img1.jpg'],
      simpleBeds: 2,
      trundleBeds: 1,
      kingBeds: 1,
      windows: 3,
      price: 350,
    };
    const mockRoomType = { ...inputData };

    RoomType.create.mockResolvedValue(mockRoomType);

    const result = await createRoomTypeController(inputData);

    expect(RoomType.create).toHaveBeenCalledWith(expect.objectContaining(inputData));
    expect(result).toEqual(mockRoomType);
  });

  test('lanza error si falla la creación', async () => {
    const error = new Error('Database error');
    RoomType.create.mockRejectedValue(error);

    await expect(createRoomTypeController({ name: 'FailRoom' })).rejects.toThrow('Database error');
    expect(console.error).toHaveBeenCalledWith('Error al crear el tipo de habitación:', error);
  });

  test('lanza error si el nombre es vacío', async () => {
    const error = new Error('Validation error: name required');
    RoomType.create.mockRejectedValue(error);

    await expect(createRoomTypeController({ name: '' })).rejects.toThrow('Validation error: name required');
    expect(console.error).toHaveBeenCalledWith('Error al crear el tipo de habitación:', error);
  });

  test('lanza error si photos no es array', async () => {
    const error = new Error('Photos must be an array');
    RoomType.create.mockRejectedValue(error);

    await expect(createRoomTypeController({ name: 'PhotoFail', photos: 'not-an-array' })).rejects.toThrow('Photos must be an array');
    expect(console.error).toHaveBeenCalledWith('Error al crear el tipo de habitación:', error);
  });

  test('maneja valores cero en camas y precio', async () => {
    const inputData = {
      id: 4,
      name: 'ZeroBeds',
      simpleBeds: 0,
      trundleBeds: 0,
      kingBeds: 0,
      price: 0,
    };
    const mockRoomType = { ...inputData };

    RoomType.create.mockResolvedValue(mockRoomType);

    const result = await createRoomTypeController(inputData);

    expect(RoomType.create).toHaveBeenCalledWith(expect.objectContaining(inputData));
    expect(result).toEqual(mockRoomType);
  });

  test('lanza error si precio es negativo', async () => {
    const error = new Error('Price must be positive');
    RoomType.create.mockRejectedValue(error);

    await expect(createRoomTypeController({ name: 'NegativePrice', price: -10 })).rejects.toThrow('Price must be positive');
    expect(console.error).toHaveBeenCalledWith('Error al crear el tipo de habitación:', error);
  });

  test('lanza error si camas son valores negativos', async () => {
    const error = new Error('Bed counts must be non-negative');
    RoomType.create.mockRejectedValue(error);

    await expect(createRoomTypeController({ name: 'NegativeBeds', simpleBeds: -1 })).rejects.toThrow('Bed counts must be non-negative');
    expect(console.error).toHaveBeenCalledWith('Error al crear el tipo de habitación:', error);
  });

  test('acepta id personalizado', async () => {
    const inputData = { id: 'P1D2', name: 'CustomID' };
    const mockRoomType = { ...inputData };

    RoomType.create.mockResolvedValue(mockRoomType);

    const result = await createRoomTypeController(inputData);

    expect(RoomType.create).toHaveBeenCalledWith(expect.objectContaining(inputData));
    expect(result).toEqual(mockRoomType);
  });

  test('no llama a create si falta el nombre', async () => {
    const error = new Error('Name is required');
    RoomType.create.mockRejectedValue(error);

    await expect(createRoomTypeController({ photos: ['photo.jpg'] })).rejects.toThrow('Name is required');
    expect(RoomType.create).toHaveBeenCalled();
  });
});
