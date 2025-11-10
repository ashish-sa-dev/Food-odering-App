const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ['user', 'admin', 'restaurant'],
      default: 'user',
    },

    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },


      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },
  },
  { timestamps: true }
);

userSchema.index({ 'address.location': '2dsphere' });

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.generateAuthToken =  function(){
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
    return token;
}

module.exports = mongoose.model('User', userSchema);
