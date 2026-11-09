const Profile = require("../models/Profile");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { pageResult, sendSuccess } = require("../utils/response");

function escapedRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const list = asyncHandler(async (req, res) => {
  const { page, limit, sort, ...filters } = req.query;
  const query = { active: true };
  if (filters.q) {
    const match = new RegExp(escapedRegex(filters.q), "i");
    query.$or = [
      { name: match },
      { role: match },
      { service: match },
      { category: match },
      { subcategories: match },
    ];
  }
  if (filters.category) query.category = filters.category;
  if (filters.subcategory) query.subcategories = filters.subcategory;
  if (filters.location && filters.location !== "Anywhere in Kenya") {
    query.location = filters.location;
  }
  if (filters.budget !== undefined) query.price = { $lte: filters.budget };
  if (filters.availability) query.availability = filters.availability;
  if (filters.language) query.languages = filters.language;
  if (filters.mpesa) query.acceptsMpesa = filters.mpesa === "yes";
  if (filters.experience) query.experience = filters.experience;
  if (filters.verified) query.verified = filters.verified === "true";

  const sorts = {
    relevance: { rating: -1, joined: 1 },
    rating: { rating: -1, reviews: -1 },
    recent: { joined: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };
  const [profiles, total] = await Promise.all([
    Profile.find(query)
      .sort(sorts[sort])
      .skip((page - 1) * limit)
      .limit(limit),
    Profile.countDocuments(query),
  ]);
  return sendSuccess(res, pageResult(profiles, page, limit, total));
});

const getById = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ _id: req.params.id, active: true });
  if (!profile) throw new AppError(404, "Freelancer profile not found.");
  return sendSuccess(res, profile);
});

const getMine = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id, active: true });
  return sendSuccess(res, profile, "Your profile loaded.");
});

const createMine = asyncHandler(async (req, res) => {
  if (req.user.role !== "freelancer") {
    throw new AppError(403, "Only freelancer accounts can create a profile.");
  }
  const existing = await Profile.findOne({ user: req.user._id });
  if (existing) throw new AppError(409, "A freelancer profile already exists.");
  const profile = await Profile.create({ ...req.body, user: req.user._id });
  return sendSuccess(res, profile, "Profile created.", 201);
});

const updateMine = asyncHandler(async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id, active: true },
    req.body,
    { new: true, runValidators: true },
  );
  if (!profile) throw new AppError(404, "Your freelancer profile was not found.");
  return sendSuccess(res, profile, "Profile updated.");
});

const deleteMine = asyncHandler(async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id, active: true },
    { active: false },
    { new: true },
  );
  if (!profile) throw new AppError(404, "Your freelancer profile was not found.");
  return sendSuccess(res, null, "Profile unpublished.");
});

module.exports = { createMine, deleteMine, getById, getMine, list, updateMine };
