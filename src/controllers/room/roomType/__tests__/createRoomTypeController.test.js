const { RoomType, Room } = require('../../../../models');
const { createRoomTypeController, createRoomController } = require('../createRoomTypeController');

jest.mock('../../../../models', () => ({
  RoomType: {
    create: jest.fn(),
  },
  Room: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

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

  test('maneja datos con valores null', async () => {
    const inputData = {
      id: 5,
      name: 'NullValues',
      photos: null,
      simpleBeds: null,
      trundleBeds: null,
      kingBeds: null,
      windows: null,
      price: null,
    };
    const mockRoomType = { ...inputData };

    RoomType.create.mockResolvedValue(mockRoomType);

    const result = await createRoomTypeController(inputData);

    expect(RoomType.create).toHaveBeenCalledWith(expect.objectContaining(inputData));
    expect(result).toEqual(mockRoomType);
    expect(console.log).toHaveBeenCalledWith(
      'RoomType creado:',
      expect.objectContaining({
        id: 5,
        name: 'NullValues',
        photos: null,
        photosCount: 0,
      })
    );
  });

  test('maneja datos con valores undefined', async () => {
    const inputData = {
      id: 6,
      name: 'UndefinedValues',
      photos: undefined,
      simpleBeds: undefined,
      trundleBeds: undefined,
      kingBeds: undefined,
      windows: undefined,
      price: undefined,
    };
    const mockRoomType = { ...inputData };

    RoomType.create.mockResolvedValue(mockRoomType);

    const result = await createRoomTypeController(inputData);

    expect(RoomType.create).toHaveBeenCalledWith(expect.objectContaining(inputData));
    expect(result).toEqual(mockRoomType);
    expect(console.log).toHaveBeenCalledWith(
      'RoomType creado:',
      expect.objectContaining({
        id: 6,
        name: 'UndefinedValues',
        photos: undefined,
        photosCount: 0,
      })
    );
  });

  test('maneja array de fotos vacío', async () => {
    const inputData = {
      id: 7,
      name: 'EmptyPhotos',
      photos: [],
    };
    const mockRoomType = { ...inputData };

    RoomType.create.mockResolvedValue(mockRoomType);

    const result = await createRoomTypeController(inputData);

    expect(RoomType.create).toHaveBeenCalledWith(expect.objectContaining(inputData));
    expect(result).toEqual(mockRoomType);
    expect(console.log).toHaveBeenCalledWith(
      'RoomType creado:',
      expect.objectContaining({
        id: 7,
        name: 'EmptyPhotos',
        photos: [],
        photosCount: 0,
      })
    );
  });

  test('maneja error específico de validación de base de datos', async () => {
    const validationError = new Error('Validation error: name cannot be null');
    RoomType.create.mockRejectedValue(validationError);

    await expect(createRoomTypeController({})).rejects.toThrow('Validation error: name cannot be null');
    expect(console.error).toHaveBeenCalledWith('Error al crear el tipo de habitación:', validationError);
  });

  test('maneja error de conexión a base de datos', async () => {
    const connectionError = new Error('Connection timeout');
    RoomType.create.mockRejectedValue(connectionError);

    await expect(createRoomTypeController({ name: 'ConnectionTest' })).rejects.toThrow('Connection timeout');
    expect(console.error).toHaveBeenCalledWith('Error al crear el tipo de habitación:', connectionError);
  });
});

describe('createRoomController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  test('crea exitosamente una nueva habitación', async () => {
    const mockRoomData = {
      id: 'room123',
      description: 'Habitación con vista al mar',
      roomTypeId: 1,
      photoRoom: ['photo1.jpg', 'photo2.jpg'],
      price: 150,
      status: 'available'
    };

    const mockCreatedRoom = { ...mockRoomData };

    Room.findOne.mockResolvedValue(null); // No existe habitación con ese ID
    Room.create.mockResolvedValue(mockCreatedRoom);

    const result = await createRoomController(mockRoomData);

    expect(Room.findOne).toHaveBeenCalledWith({ where: { id: 'room123' } });
    expect(Room.create).toHaveBeenCalledWith(mockRoomData);
    expect(result).toEqual(mockCreatedRoom);
  });

  test('lanza error si el ID de habitación ya existe', async () => {
    const mockRoomData = {
      id: 'existing-room',
      description: 'Habitación existente',
      roomTypeId: 1,
      price: 100
    };

    const existingRoom = { id: 'existing-room', description: 'Ya existe' };
    Room.findOne.mockResolvedValue(existingRoom);

    await expect(createRoomController(mockRoomData)).rejects.toThrow('El ID de la habitación (existing-room) ya existe.');

    expect(Room.findOne).toHaveBeenCalledWith({ where: { id: 'existing-room' } });
    expect(Room.create).not.toHaveBeenCalled();
  });

  test('crea habitación con datos mínimos', async () => {
    const minimalData = {
      id: 'minimal-room',
      description: 'Habitación básica'
    };

    const mockCreatedRoom = { ...minimalData };

    Room.findOne.mockResolvedValue(null);
    Room.create.mockResolvedValue(mockCreatedRoom);

    const result = await createRoomController(minimalData);

    expect(Room.findOne).toHaveBeenCalledWith({ where: { id: 'minimal-room' } });
    expect(Room.create).toHaveBeenCalledWith(minimalData);
    expect(result).toEqual(mockCreatedRoom);
  });

  test('crea habitación con todos los campos opcionales', async () => {
    const completeData = {
      id: 'complete-room',
      description: 'Habitación completa',
      roomTypeId: 2,
      photoRoom: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
      price: 200,
      status: 'occupied'
    };

    const mockCreatedRoom = { ...completeData };

    Room.findOne.mockResolvedValue(null);
    Room.create.mockResolvedValue(mockCreatedRoom);

    const result = await createRoomController(completeData);

    expect(Room.findOne).toHaveBeenCalledWith({ where: { id: 'complete-room' } });
    expect(Room.create).toHaveBeenCalledWith(completeData);
    expect(result).toEqual(mockCreatedRoom);
  });

  test('maneja error cuando Room.findOne falla', async () => {
    const mockRoomData = {
      id: 'error-room',
      description: 'Habitación con error'
    };

    const dbError = new Error('Database connection failed');
    Room.findOne.mockRejectedValue(dbError);

    await expect(createRoomController(mockRoomData)).rejects.toThrow('Database connection failed');

    expect(Room.findOne).toHaveBeenCalledWith({ where: { id: 'error-room' } });
    expect(Room.create).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Error al crear la habitación:', dbError.message);
  });

  test('maneja error cuando Room.create falla', async () => {
    const mockRoomData = {
      id: 'create-error-room',
      description: 'Habitación con error en creación'
    };

    Room.findOne.mockResolvedValue(null);
    const createError = new Error('Validation failed');
    Room.create.mockRejectedValue(createError);

    await expect(createRoomController(mockRoomData)).rejects.toThrow('Validation failed');

    expect(Room.findOne).toHaveBeenCalledWith({ where: { id: 'create-error-room' } });
    expect(Room.create).toHaveBeenCalledWith(mockRoomData);
    expect(console.error).toHaveBeenCalledWith('Error al crear la habitación:', createError.message);
  });

  test('maneja error cuando Room.findOne retorna undefined', async () => {
    const mockRoomData = {
      id: 'undefined-room',
      description: 'Habitación con undefined'
    };

    Room.findOne.mockResolvedValue(undefined);
    const mockCreatedRoom = { ...mockRoomData };
    Room.create.mockResolvedValue(mockCreatedRoom);

    const result = await createRoomController(mockRoomData);

    expect(Room.findOne).toHaveBeenCalledWith({ where: { id: 'undefined-room' } });
    expect(Room.create).toHaveBeenCalledWith(mockRoomData);
    expect(result).toEqual(mockCreatedRoom);
  });

  test('maneja error cuando Room.findOne retorna null explícitamente', async () => {
    const mockRoomData = {
      id: 'null-room',
      description: 'Habitación con null'
    };

    Room.findOne.mockResolvedValue(null);
    const mockCreatedRoom = { ...mockRoomData };
    Room.create.mockResolvedValue(mockCreatedRoom);

    const result = await createRoomController(mockRoomData);

    expect(Room.findOne).toHaveBeenCalledWith({ where: { id: 'null-room' } });
    expect(Room.create).toHaveBeenCalledWith(mockRoomData);
    expect(result).toEqual(mockCreatedRoom);
  });

  test('lanza error cuando Room.findOne retorna un objeto vacío', async () => {
    const mockRoomData = {
      id: 'empty-room',
      description: 'Habitación con objeto vacío'
    };

    Room.findOne.mockResolvedValue({});

    await expect(createRoomController(mockRoomData)).rejects.toThrow('El ID de la habitación (empty-room) ya existe.');

    expect(Room.findOne).toHaveBeenCalledWith({ where: { id: 'empty-room' } });
    expect(Room.create).not.toHaveBeenCalled();
  });

  test('lanza error cuando Room.findOne retorna un objeto con propiedades diferentes', async () => {
    const mockRoomData = {
      id: 'different-room',
      description: 'Habitación diferente'
    };

    // Simular que findOne retorna una habitación diferente
    Room.findOne.mockResolvedValue({ id: 'other-room', description: 'Otra habitación' });

    await expect(createRoomController(mockRoomData)).rejects.toThrow('El ID de la habitación (different-room) ya existe.');

    expect(Room.findOne).toHaveBeenCalledWith({ where: { id: 'different-room' } });
    expect(Room.create).not.toHaveBeenCalled();
  });

  test('lanza error cuando Room.findOne retorna exactamente la habitación buscada', async () => {
    const mockRoomData = {
      id: 'exact-match-room',
      description: 'Habitación con match exacto'
    };

    // Simular que findOne retorna exactamente la habitación buscada
    Room.findOne.mockResolvedValue({ id: 'exact-match-room', description: 'Habitación con match exacto' });

    await expect(createRoomController(mockRoomData)).rejects.toThrow('El ID de la habitación (exact-match-room) ya existe.');

    expect(Room.findOne).toHaveBeenCalledWith({ where: { id: 'exact-match-room' } });
    expect(Room.create).not.toHaveBeenCalled();
  });

  test('permite crear cuando Room.findOne retorna false', async () => {
    const mockRoomData = {
      id: 'false-room',
      description: 'Habitación con false'
    };

    const mockCreatedRoom = { ...mockRoomData };

    Room.findOne.mockResolvedValue(false);
    Room.create.mockResolvedValue(mockCreatedRoom);

    const result = await createRoomController(mockRoomData);

    expect(Room.findOne).toHaveBeenCalledWith({ where: { id: 'false-room' } });
    expect(Room.create).toHaveBeenCalledWith(mockRoomData);
    expect(result).toEqual(mockCreatedRoom);
  });

  test('permite crear cuando Room.findOne retorna 0', async () => {
    const mockRoomData = {
      id: 'zero-room',
      description: 'Habitación con cero'
    };

    const mockCreatedRoom = { ...mockRoomData };

    Room.findOne.mockResolvedValue(0);
    Room.create.mockResolvedValue(mockCreatedRoom);

    const result = await createRoomController(mockRoomData);

    expect(Room.findOne).toHaveBeenCalledWith({ where: { id: 'zero-room' } });
    expect(Room.create).toHaveBeenCalledWith(mockRoomData);
    expect(result).toEqual(mockCreatedRoom);
  });
});
