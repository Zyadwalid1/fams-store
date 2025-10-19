import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Validation functions
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  // Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

const validateMobile = (mobile) => {
  // Egyptian mobile number validation
  // Format: 01[0,1,2,5]xxxxxxxx (total 11 digits)
  const re = /^01[0125][0-9]{8}$/;
  return re.test(mobile);
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    },
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  mobile: {
    type: String,
    required: [true, 'Please provide your mobile number'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^01[0125][0-9]{8}$/.test(v);
      },
      message: props => `${props.value} is not a valid Egyptian mobile number!`
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'support', 'doctor'],
    default: 'user'
  },
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  }],
  paymentMethods: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod'
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  refreshToken: String,
  googleId: {
    type: String,
    sparse: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    if (!enteredPassword) {
      return false;
    }
    
    if (!this.password) {
      return false;
    }
    
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to verify email
userSchema.methods.verifyEmail = async function() {
  this.isVerified = true;
  this.verificationToken = undefined;
  this.verificationTokenExpires = undefined;
  return await this.save();
};

export default mongoose.model('User', userSchema);
