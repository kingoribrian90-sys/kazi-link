const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { getEnv } = require("../config/env");
const { connectDB } = require("../config/db");
const User = require("../models/User");
const Profile = require("../models/Profile");
const JobRequest = require("../models/JobRequest");
const Review = require("../models/Review");

async function seed() {
  const env = getEnv();
  await connectDB(env.MONGODB_URI);
  const { seedFreelancers, seedReviews } = await import("../../../src/data.js");
  const demoPassword = await bcrypt.hash("DemoPass123!", 12);

  const owner = await User.findOneAndUpdate(
    { email: "demo-owner@kazilink.local" },
    {
      $setOnInsert: {
        name: "Demo Business Owner",
        email: "demo-owner@kazilink.local",
        passwordHash: demoPassword,
        role: "owner",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const freelancerUser = await User.findOneAndUpdate(
    { email: "demo-freelancer@kazilink.local" },
    {
      $setOnInsert: {
        name: "Wanjiku Njeri",
        email: "demo-freelancer@kazilink.local",
        passwordHash: demoPassword,
        role: "freelancer",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const profiles = new Map();
  for (const sample of seedFreelancers) {
    const { id, remote, profileViews, ...fields } = sample;
    const profile = await Profile.findOneAndUpdate(
      { seedKey: `profile-${id}` },
      {
        $set: {
          ...fields,
          seedKey: `profile-${id}`,
          user: id === "f1" ? freelancerUser._id : null,
          active: true,
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
    profiles.set(id, profile);
  }

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 21);
  for (const sampleReview of seedReviews) {
    const profile = profiles.get(sampleReview.freelancerId);
    const seedKey = `review-${sampleReview.id}`;
    const request = await JobRequest.findOneAndUpdate(
      { seedKey },
      {
        $set: {
          seedKey,
          clientId: owner._id,
          clientName: sampleReview.client,
          freelancerId: profile._id,
          freelancerName: profile.name,
          service: profile.service,
          description: "A sample completed project for marketplace testing.",
          budget: Math.max(profile.price, 500),
          deadline,
          location: profile.location,
          status: "completed",
          reviewed: true,
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
    await Review.findOneAndUpdate(
      { seedKey },
      {
        $set: {
          seedKey,
          requestId: request._id,
          freelancerId: profile._id,
          clientId: owner._id,
          client: sampleReview.client,
          rating: sampleReview.rating,
          comment: sampleReview.comment,
          date: sampleReview.date,
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
  }

  for (const profile of profiles.values()) {
    const [summary] = await Review.aggregate([
      { $match: { freelancerId: profile._id } },
      {
        $group: {
          _id: "$freelancerId",
          rating: { $avg: "$rating" },
          reviews: { $sum: 1 },
        },
      },
    ]);
    profile.rating = summary ? Number(summary.rating.toFixed(1)) : 0;
    profile.reviews = summary ? summary.reviews : 0;
    await profile.save();
  }

  console.log(
    `Seeded ${profiles.size} profiles and ${seedReviews.length} reviews. ` +
      "Demo accounts: demo-owner@kazilink.local / demo-freelancer@kazilink.local (password: DemoPass123!).",
  );
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(`Seed failed: ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
