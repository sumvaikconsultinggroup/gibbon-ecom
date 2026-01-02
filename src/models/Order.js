import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    customer: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
    },
    items: [
      {
        productId: String,
        name: String,
        quantity: Number,
        price: Number,
        variant: {
          option1Value: String,
          option2Value: String,
          option3Value: String,
        },
        imageUrl: String,
      },
    ],
    shippingAddress: {
      address: String,
      address1: String,
      city: String,
      state: String,
      country: String,
      zipcode: String,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    subtotal: Number,
    discount: Number,
    shipping: Number,
    taxes: Number,
    paymentMethod: {
      type: String,
      enum: ['cod', 'payu', 'razorpay'],
      default: 'cod',
    },
    paymentDetails: {
      transactionId: String,
      status: String,
      paidAt: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    notes: String,
  },
  { timestamps: true }
)

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

export default Order
