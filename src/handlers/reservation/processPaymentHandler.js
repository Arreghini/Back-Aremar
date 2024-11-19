const processPaymentHandler = async (req, res) => {
    const { reservationId, paymentMethod, paymentDetails } = req.body;
    
    try {
      // Procesar el pago con tu gateway de pagos preferido (Stripe, PayPal, etc)
      const payment = await processPayment(paymentDetails);
      
      if (payment.success) {
        // Actualizar el estado de la reserva
        await Reservation.update(
          { status: 'confirmed' },
          { where: { id: reservationId }}
        );
        
        res.status(200).json({
          success: true,
          message: 'Pago procesado y reserva confirmada'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al procesar el pago'
      });
    }
  };
  