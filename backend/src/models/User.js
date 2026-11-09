const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: { type: String, trim: true, unique: true, sparse: true, maxlength: 30 },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["owner", "freelancer", "admin"],
      default: "owner",
      required: true,
    },
    refreshTokenHash: { type: String, select: false },
    savedFreelancers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Profile" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

userSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, value) {
    delete value._id;
    delete value.__v;
    delete value.passwordHash;
    delete value.refreshTokenHash;
    delete value.savedFreelancers;
    return value;
  },
});

module.exports = mongoose.model("User", userSchema);
