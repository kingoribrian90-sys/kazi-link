const mongoose = require("mongoose");

const portfolioItemSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    seedKey: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, required: true, trim: true, maxlength: 100 },
    service: { type: String, required: true, trim: true, maxlength: 150 },
    category: { type: String, required: true, trim: true, maxlength: 100 },
    subcategories: [{ type: String, trim: true, maxlength: 150 }],
    price: { type: Number, required: true, min: 500 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },
    location: { type: String, required: true, trim: true, maxlength: 100 },
    languages: [{ type: String, trim: true, maxlength: 50 }],
    verified: { type: Boolean, default: false },
    experience: {
      type: String,
      enum: ["new", "established", "expert"],
      default: "new",
    },
    availability: {
      type: String,
      enum: ["this week", "this month", "flexible"],
      default: "flexible",
    },
    acceptsMpesa: { type: Boolean, default: false },
    online: { type: Boolean, default: false },
    bio: { type: String, required: true, trim: true, maxlength: 2000 },
    avatar: { type: String, default: "" },
    portfolio: { type: [portfolioItemSchema], default: [] },
    joined: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

profileSchema.index({ category: 1, price: 1, rating: -1 });
profileSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, value) {
    delete value._id;
    delete value.__v;
    delete value.user;
    delete value.seedKey;
    delete value.active;
    return value;
  },
});

module.exports = mongoose.model("Profile", profileSchema);
