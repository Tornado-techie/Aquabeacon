const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plant name is required'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Multi-tenant support
  consultant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  // Location with 2dsphere index for geospatial queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      street: String,
      city: String,
      county: {
        type: String,
        required: true
      },
      postalCode: String
    }
  },
  // Plant details
  capacity: {
    dailyProduction: {
      type: Number, // in liters
      required: true
    },
    bottleSize: [{
      type: Number, // in ml
      enum: [300, 500, 750, 1000, 1500, 5000, 10000, 20000]
    }],
    storageCapacity: Number // in liters
  },
  // Equipment information
  equipment: [{
    name: String,
    type: {
      type: String,
      enum: ['filtration', 'uv', 'ro', 'ozonation', 'bottling', 'labeling', 'storage']
    },
    manufacturer: String,
    model: String,
    serialNumber: String,
    installDate: Date,
    lastMaintenance: Date,
    nextMaintenance: Date
  }],
  // Water source
  waterSource: {
    type: {
      type: String,
      enum: ['borehole', 'municipal', 'spring', 'surface', 'rainwater'],
      required: true
    },
    sourceLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    depth: Number, // for boreholes
    flowRate: Number, // liters per hour
    quality: {
      pH: Number,
      tds: Number, // Total Dissolved Solids
      turbidity: Number,
      lastTested: Date
    }
  },
  // Operational status
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'closed'],
    default: 'pending'
  },
  operationalSince: Date,
  // Employees
  employees: {
    total: {
      type: Number,
      default: 0
    },
    trained: {
      type: Number,
      default: 0
    },
    certifications: [{
      employeeName: String,
      certificationType: String,
      issueDate: Date,
      expiryDate: Date,
      certificateNumber: String
    }]
  },
  // Contact information
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  // Business hours
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  // Photos and documents
  photos: [{
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Compliance
  lastInspection: Date,
  nextInspectionDue: Date,
  complianceScore: {
    type: Number,
    min: 0,
    max: 100
  },
  // Product codes (SM/ISM/DM)
  productCodes: [{
    code: String, // e.g., "SM/2023/001"
    productName: String,
    batchPrefix: String,
    registeredDate: Date,
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended'],
      default: 'active'
    }
  }],
  // Metrics
  metrics: {
    totalProduction: {
      type: Number,
      default: 0
    },
    totalSales: {
      type: Number,
      default: 0
    },
    complaintCount: {
      type: Number,
      default: 0
    },
    lastProductionDate: Date
  }
}, {
  timestamps: true
});

// Indexes
plantSchema.index({ location: '2dsphere' }); // For geospatial queries
plantSchema.index({ owner: 1 });
plantSchema.index({ consultant: 1 });
plantSchema.index({ status: 1 });
plantSchema.index({ 'location.address.county': 1 });
plantSchema.index({ registrationNumber: 1 });

// Generate unique registration number
plantSchema.pre('save', async function(next) {
  if (!this.registrationNumber) {
    const county = this.location.address.county.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const count = await mongoose.model('Plant').countDocuments({
      'location.address.county': this.location.address.county
    });
    this.registrationNumber = `WP/${county}/${year}/${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for permit status
plantSchema.virtual('permits', {
  ref: 'Permit',
  localField: '_id',
  foreignField: 'plant'
});

// Virtual for complaints
plantSchema.virtual('complaints', {
  ref: 'Complaint',
  localField: '_id',
  foreignField: 'plant'
});

plantSchema.set('toJSON', { virtuals: true });
plantSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.Plant || mongoose.model('Plant', plantSchema);