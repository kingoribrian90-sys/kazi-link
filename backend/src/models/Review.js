const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    seedKey: { type: String, unique: true, sparse: true },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRequest",
      required: true,
      unique: true,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    client: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    date: { type: String, required: true },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

reviewSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, value) {
    delete value._id;
    delete value.__v;
    delete value.seedKey;
    delete value.requestId;
    delete value.clientId;
    value.freelancerId = String(value.freelancerId);
    return value;
  },
});

module.exports = mongoose.model("Review", reviewSchema);
