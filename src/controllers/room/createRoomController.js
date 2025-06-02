const { Room, RoomType, RoomDetail } = require('../../models');

const createRoomController = async (data) => {
  try {
    console.log('=== DEBUG CONTROLLER COMPLETO ===');
    console.log('Datos recibidos en el controlador de habitación:', JSON.stringify(data, null, 2));
    
    const { 
      id, 
      description, 
      roomTypeId, 
      detailRoomId, 
      photoRoom, 
      price, 
      status,
      roomDetails 
    } = data;
    
    // Validaciones básicas
    if (!description || description.trim() === '') {
      throw new Error('La descripción es requerida');
    }
    
    if (!roomTypeId) {
      throw new Error('El tipo de habitación es requerido');
    }
    
    if (!price || isNaN(parseFloat(price))) {
      throw new Error('El precio debe ser un número válido');
    }
    
    // Procesar roomDetails
    let parsedRoomDetails = null;
    if (roomDetails) {
      try {
        parsedRoomDetails = typeof roomDetails === 'string' 
          ? JSON.parse(roomDetails) 
          : roomDetails;
        console.log('Room details parseados:', parsedRoomDetails);
      } catch (parseError) {
        console.error('Error parseando roomDetails:', parseError);
        throw new Error('Los detalles de la habitación no tienen un formato JSON válido');
      }
    }
    
    // Generar/validar ID de la habitación
    let finalRoomId = id;
    if (finalRoomId) {
      const existingRoom = await Room.findOne({ where: { id: finalRoomId } });
      if (existingRoom) {
        let counter = 1;
        let newId = `${finalRoomId}-${counter}`;
        while (await Room.findOne({ where: { id: newId } })) {
          counter++;
          newId = `${finalRoomId}-${counter}`;
        }
        finalRoomId = newId;
        console.log(`Nuevo ID generado: ${finalRoomId}`);
      }
    } else {
      const timestamp = Date.now().toString().slice(-6);
      finalRoomId = `ROOM-${timestamp}`;
    }
    
    // Crear RoomDetail si se proporcionaron detalles
    let finalDetailRoomId = detailRoomId;
    if (parsedRoomDetails) {
      try {
        console.log('Creando RoomDetail...');
        
        const roomDetailData = {
          cableTvService: parsedRoomDetails.cableTvService || false,
          smart_TV: parsedRoomDetails.smart_TV || false,
          wifi: parsedRoomDetails.wifi || false,
          microwave: parsedRoomDetails.microwave || false,
          pava_electrica: parsedRoomDetails.pava_electrica || false
        };
        
        console.log('Datos para RoomDetail:', roomDetailData);
        
        const newRoomDetail = await RoomDetail.create(roomDetailData);
        finalDetailRoomId = newRoomDetail.id;
        console.log('✅ RoomDetail creado con ID:', finalDetailRoomId);
        
      } catch (detailError) {
        console.error('❌ Error creando RoomDetail:', detailError);
        throw new Error(`Error al crear los detalles de la habitación: ${detailError.message}`);
      }
    }

    // Preparar datos para crear la habitación
    const roomData = {
      id: finalRoomId,
      description: description.trim(),
      roomTypeId: roomTypeId,      
      detailRoomId: finalDetailRoomId, // ✅ Usar detailRoomId (no roomDetailId)
      photoRoom: photoRoom || null,
      price: parseFloat(price),
      status: status || 'available'
    };
    
    console.log('Datos finales para crear habitación:', JSON.stringify(roomData, null, 2));

    // Crear la habitación
    const newRoom = await Room.create(roomData);

    console.log('✅ Habitación creada exitosamente con ID:', newRoom.id);
    console.log('✅ Detalles asociados con ID:', finalDetailRoomId);
    
    // Ahora sí puedes incluir las asociaciones con los alias correctos
    const roomWithDetails = await Room.findByPk(newRoom.id, {
      include: [
        {
          model: RoomDetail,
          as: 'roomDetail' // ✅ Usar el alias correcto
        },
        {
          model: RoomType,
          as: 'roomType'
        }
      ]
    });
    
    return roomWithDetails || newRoom;
    
  } catch (error) {
    console.error('❌ Error detallado al crear la habitación:', error);
    throw error;
  }
};

module.exports = createRoomController;
