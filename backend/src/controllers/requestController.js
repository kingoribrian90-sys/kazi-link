const JobRequest = require("../models/JobRequest");
const Profile = require("../models/Profile");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { pageResult, sendSuccess } = require("../utils/response");

const list = asyncHandler(async (req, res) => {
  const { page, limit, sort, status } = req.query;
  const query = {};
  if (req.user.role === "owner") query.clientId = req.user._id;
  else if (req.user.role === "freelancer") {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return sendSuccess(res, pageResult([], page, limit, 0));
    query.freelancerId = profile._id;
  } else if (req.user.role !== "admin") {
    throw new AppError(403, "You cannot view job requests.");
  }
  if (status) query.status = status;
  const direction = sort === "oldest" ? 1 : -1;
  const [requests, total] = await Promise.all([
    JobRequest.find(query)
      .sort({ createdAt: direction })
      .skip((page - 1) * limit)
      .limit(limit),
    JobRequest.countDocuments(query),
  ]);
  return sendSuccess(res, pageResult(requests, page, limit, total));
});

const getById = asyncHandler(async (req, res) => {
  const request = await JobRequest.findById(req.params.id);
  if (!request) throw new AppError(404, "Job request not found.");
  const profile = await Profile.findById(request.freelancerId);
  const isClient = request.clientId.equals(req.user._id);
  const isFreelancer = profile?.user?.equals(req.user._id);
  if (!isClient && !isFreelancer && req.user.role !== "admin") {
    throw new AppError(403, "You cannot view this job request.");
  }
  return sendSuccess(res, request);
});

const create = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({
    _id: req.body.freelancerId,
    active: true,
  });
  if (!profile) throw new AppError(404, "Freelancer profile not found.");
  if (profile.user?.equals(req.user._id)) {
    throw new AppError(400, "You cannot send a job request to yourself.");
  }
  const request = await JobRequest.create({
    ...req.body,
    clientId: req.user._id,
    clientName: req.user.name,
    freelancerName: profile.name,
  });
  return sendSuccess(res, request, "Job request created.", 201);
});

const updateStatus = asyncHandler(async (req, res) => {
  const request = await JobRequest.findById(req.params.id);
  if (!request) throw new AppError(404, "Job request not found.");
  const profile = await Profile.findById(request.freelancerId);
  if (req.user.role !== "admin" && !profile?.user?.equals(req.user._id)) {
    throw new AppError(403, "Only the assigned freelancer can update this request.");
  }
  const allowed =
    (request.status === "pending" &&
      ["accepted", "declined"].includes(req.body.status)) ||
    (request.status === "accepted" && req.body.status === "completed");
  if (!allowed) {
    throw new AppError(409, `A ${request.status} request cannot be changed to ${req.body.status}.`);
  }
  request.status = req.body.status;
  await request.save();
  return sendSuccess(res, request, "Job request status updated.");
});

const remove = asyncHandler(async (req, res) => {
  const request = await JobRequest.findById(req.params.id);
  if (!request) throw new AppError(404, "Job request not found.");
  if (
    req.user.role !== "admin" &&
    (!request.clientId.equals(req.user._id) || request.status !== "pending")
  ) {
    throw new AppError(403, "Only your pending job requests can be cancelled.");
  }
  await request.deleteOne();
  return sendSuccess(res, null, "Job request cancelled.");
});

module.exports = { create, getById, list, remove, updateStatus };
