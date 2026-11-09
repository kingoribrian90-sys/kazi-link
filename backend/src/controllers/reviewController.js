const JobRequest = require("../models/JobRequest");
const Profile = require("../models/Profile");
const Review = require("../models/Review");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { pageResult, sendSuccess } = require("../utils/response");

async function updateProfileRating(profileId) {
  const [result] = await Review.aggregate([
    { $match: { freelancerId: profileId } },
    { $group: { _id: "$freelancerId", rating: { $avg: "$rating" }, reviews: { $sum: 1 } } },
  ]);
  await Profile.findByIdAndUpdate(profileId, {
    rating: result ? Number(result.rating.toFixed(1)) : 0,
    reviews: result ? result.reviews : 0,
  });
}

const list = asyncHandler(async (req, res) => {
  const { page, limit, sort, freelancerId } = req.query;
  const query = freelancerId ? { freelancerId } : {};
  const direction = sort === "oldest" ? 1 : -1;
  const [reviews, total] = await Promise.all([
    Review.find(query)
      .sort({ createdAt: direction })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments(query),
  ]);
  return sendSuccess(res, pageResult(reviews, page, limit, total));
});

const create = asyncHandler(async (req, res) => {
  const request = await JobRequest.findOne({
    _id: req.body.requestId,
    clientId: req.user._id,
    status: "completed",
    reviewed: false,
  });
  if (!request) {
    throw new AppError(409, "Only completed, unreviewed job requests can be reviewed.");
  }
  const review = await Review.create({
    requestId: request._id,
    freelancerId: request.freelancerId,
    clientId: req.user._id,
    client: req.user.name,
    rating: req.body.rating,
    comment: req.body.comment,
    date: new Date().toLocaleDateString("en-KE", { month: "short", year: "numeric" }),
  });
  request.reviewed = true;
  await request.save();
  await updateProfileRating(request.freelancerId);
  return sendSuccess(res, review, "Review posted.", 201);
});

const update = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError(404, "Review not found.");
  if (req.user.role !== "admin" && !review.clientId.equals(req.user._id)) {
    throw new AppError(403, "You can only edit your own reviews.");
  }
  Object.assign(review, req.body);
  await review.save();
  await updateProfileRating(review.freelancerId);
  return sendSuccess(res, review, "Review updated.");
});

const remove = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError(404, "Review not found.");
  if (req.user.role !== "admin" && !review.clientId.equals(req.user._id)) {
    throw new AppError(403, "You can only delete your own reviews.");
  }
  await JobRequest.findByIdAndUpdate(review.requestId, { reviewed: false });
  await review.deleteOne();
  await updateProfileRating(review.freelancerId);
  return sendSuccess(res, null, "Review deleted.");
});

module.exports = { create, list, remove, update };
