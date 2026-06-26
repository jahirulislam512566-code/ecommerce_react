import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: [true, "Please provide your name"],
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password must be at least 8 characters"], // Changed to 8 to match your controller requirements
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  cartData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
},
{
  timestamps: true,
  minimize: false,
}
);

// Automatically hash password before saving to DB
// Automatically hash password before saving to DB
userSchema.pre("save", async function () {
  // If password isn't changed, stop executing and let Mongoose save
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Clean custom method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;