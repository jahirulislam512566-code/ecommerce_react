// backend/models/orderModel.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    items: { 
        type: Array, 
        required: true,
        validate: {
            validator: function(items) {
                return items && items.length > 0;
            },
            message: 'Order must contain at least one item'
        }
    },
    subtotal: { 
        type: Number, 
        required: true,
        min: 0 
    },
    deliveryCharge: { 
        type: Number, 
        default: 0,
        min: 0 
    },
    discount: { 
        type: Number, 
        default: 0,
        min: 0 
    },
    totalAmount: { 
        type: Number, 
        required: true,
        min: 0 
    },
    address: { 
        type: Object, 
        required: true 
    },
    status: { 
        type: String, 
        required: true, 
        default: 'Pending',
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']
    },
    paymentMethod: { 
        type: String, 
        required: true,
        enum: ['cod', 'bkash', 'nagad', 'rocket', 'stripe', 'razorpay']
    },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    payment: { 
        type: Boolean, 
        required: true, 
        default: false 
    },
    trackingNumber: { 
        type: String, 
        default: null 
    },
    deliveryMethod: { 
        type: String, 
        enum: ['standard', 'express'],
        default: 'standard'
    },
    deliveryNote: { 
        type: String, 
        default: '' 
    },
    transactionId: { 
        type: String, 
        default: null 
    },
    orderDate: { 
        type: Date, 
        default: Date.now 
    },
    date: { 
        type: Number, 
        required: true,
        default: Date.now 
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// ✅ Indexes for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

// ✅ Virtual for item count
orderSchema.virtual('itemCount').get(function() {
    if (!this.items) return 0;
    return this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
});

// ✅ Pre-save middleware to ensure totalAmount is correct
orderSchema.pre('save', function(next) {
    // Calculate total from items
    const itemsTotal = this.items.reduce((sum, item) => {
        return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);
    
    // Apply discount
    const discountAmount = itemsTotal * ((this.discount || 0) / 100);
    const total = itemsTotal + (this.deliveryCharge || 0) - discountAmount;
    
    // Ensure totalAmount matches calculation
    if (this.totalAmount !== total) {
        console.warn(`Total amount mismatch. Expected: ${total}, Actual: ${this.totalAmount}. Updating...`);
        this.totalAmount = total;
    }
    
    next();
});

// ✅ Pre-save middleware for date
orderSchema.pre('save', function(next) {
    if (!this.date) {
        this.date = Date.now();
    }
    next();
});

// ✅ ToJSON transform to include virtuals
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// ✅ Use existing model or create new one
const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);

export default orderModel;