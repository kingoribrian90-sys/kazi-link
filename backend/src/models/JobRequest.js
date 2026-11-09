const mongoose = require("mongoose");

const jobRequestSchema = new mongoose.Schema(
  {
    seedKey: { type: String, unique: true, sparse: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    clientName: { type: String, required: true, trim: true },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    freelancerName: { type: String, required: true, trim: true },
    service: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, minlength: 12, maxlength: 4000 },
    budget: { type: Number, required: true, min: 500 },
    deadline: { type: Date, required: true },
    location: { type: String, required: true, trim: true, maxlength: 100 },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed"],
      default: "pending",
    },
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

jobRequestSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, value) {
    delete value._id;
    delete value.__v;
    delete value.seedKey;
    value.clientId = String(value.clientId);
    value.freelancerId = String(value.freelancerId);
    if (value.deadline) value.deadline = value.deadline.toISOString().slice(0, 10);
    return value;
  },
});

module.exports = mongoose.model("JobRequest", jobRequestSchema);
