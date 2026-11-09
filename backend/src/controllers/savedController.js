const User = require("../models/User");
const Profile = require("../models/Profile");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { pageResult, sendSuccess } = require("../utils/response");

const list = asyncHandler(async (req, res) => {
  const { page, limit, q, category, sort } = req.query;
  const user = await User.findById(req.user._id).populate({
    path: "savedFreelancers",
    match: { active: true },
  });
  let profiles = user.savedFreelancers;
  if (q) {
    const needle = q.toLowerCase();
    profiles = profiles.filter((profile) =>
      [profile.name, profile.role, profile.service, profile.category]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }
  if (category) profiles = profiles.filter((profile) => profile.category === category);
  const comparators = {
    name_asc: (a, b) => a.name.localeCompare(b.name),
    rating_desc: (a, b) => b.rating - a.rating,
    price_asc: (a, b) => a.price - b.price,
  };
  profiles.sort(comparators[sort]);
  const total = profiles.length;
  const pageProfiles = profiles.slice((page - 1) * limit, page * limit);
  return sendSuccess(res, {
    ...pageResult(pageProfiles, page, limit, total),
    profileIds: pageProfiles.map((profile) => profile.id),
  });
});

const toggle = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({
    _id: req.params.profileId,
    active: true,
  });
  if (!profile) throw new AppError(404, "Freelancer profile not found.");
  const user = await User.findById(req.user._id);
  const saved = user.savedFreelancers.some((id) => id.equals(profile._id));
  if (saved) user.savedFreelancers.pull(profile._id);
  else user.savedFreelancers.addToSet(profile._id);
  await user.save();
  return sendSuccess(
    res,
    {
      saved: !saved,
      profileIds: user.savedFreelancers.map(String),
    },
    saved ? "Freelancer removed from saved list." : "Freelancer saved.",
  );
});

module.exports = { list, toggle };
