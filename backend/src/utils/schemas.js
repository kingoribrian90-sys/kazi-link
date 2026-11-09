const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier.");
const identity = z
  .string()
  .trim()
  .min(3)
  .max(254)
  .refine(
    (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
      /^[+\d][\d\s()-]{6,29}$/.test(value),
    "Enter a valid email address or phone number.",
  );
const password = z
  .string()
  .min(6)
  .max(128)
  .refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password is too long.");
const pageQuery = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};
const emptyQuery = z.object({}).strict();
const idParams = z.object({ id: objectId });
const profileIdParams = z.object({ profileId: objectId });

const registerBody = z.object({
  name: z.string().trim().min(2).max(100),
  identity,
  password,
  role: z.enum(["owner", "freelancer"]).default("owner"),
});
const loginBody = z.object({ identity, password });
const refreshBody = z.object({ refreshToken: z.string().min(1) });
const profileBody = z.object({
  name: z.string().trim().min(2).max(100),
  role: z.string().trim().min(2).max(100),
  service: z.string().trim().min(2).max(150),
  category: z.string().trim().min(2).max(100),
  subcategories: z.array(z.string().trim().min(1).max(150)).max(30).default([]),
  price: z.coerce.number().min(500).max(100000000),
  location: z.string().trim().min(2).max(100),
  languages: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  experience: z.enum(["new", "established", "expert"]),
  availability: z.enum(["this week", "this month", "flexible"]),
  acceptsMpesa: z.boolean(),
  online: z.boolean().optional(),
  bio: z.string().trim().min(20).max(2000),
  avatar: z.string().max(2048).default(""),
  portfolio: z
    .array(
      z.object({
        image: z.string().max(2048).default(""),
        title: z.string().trim().min(1).max(120),
        description: z.string().trim().min(1).max(500),
      }),
    )
    .max(30)
    .default([]),
});
const profileQuery = z.object({
  ...pageQuery,
  q: z.string().trim().max(150).default(""),
  category: z.string().trim().max(100).default(""),
  subcategory: z.string().trim().max(150).default(""),
  location: z.string().trim().max(100).default(""),
  budget: z.coerce.number().min(0).optional(),
  availability: z.enum(["this week", "this month", "flexible"]).optional(),
  language: z.string().trim().max(50).optional(),
  mpesa: z.enum(["yes", "no"]).optional(),
  experience: z.enum(["new", "established", "expert"]).optional(),
  verified: z.enum(["true", "false"]).optional(),
  sort: z.enum(["relevance", "rating", "recent", "price_asc", "price_desc"]).default("relevance"),
});
const requestBody = z.object({
  freelancerId: objectId,
  service: z.string().trim().min(2).max(150),
  description: z.string().trim().min(12).max(4000),
  budget: z.coerce.number().min(500).max(100000000),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const selected = new Date(`${value}T00:00:00Z`);
      const today = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
      return (
        !Number.isNaN(selected.getTime()) &&
        selected.toISOString().slice(0, 10) === value &&
        selected >= today
      );
    }, "Deadline cannot be in the past."),
  location: z.string().trim().min(2).max(100),
});
const requestQuery = z.object({
  ...pageQuery,
  status: z.enum(["pending", "accepted", "declined", "completed"]).optional(),
  sort: z.enum(["newest", "oldest"]).default("newest"),
});
const statusBody = z.object({
  status: z.enum(["accepted", "declined", "completed"]),
});
const reviewBody = z.object({
  requestId: objectId,
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(2000),
});
const reviewUpdateBody = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  comment: z.string().trim().min(10).max(2000).optional(),
}).refine((value) => Object.keys(value).length > 0, "Provide a rating or comment.");
const reviewQuery = z.object({
  ...pageQuery,
  freelancerId: objectId.optional(),
  sort: z.enum(["newest", "oldest"]).default("newest"),
});
const savedQuery = z.object({
  ...pageQuery,
  q: z.string().trim().max(150).default(""),
  category: z.string().trim().max(100).default(""),
  sort: z.enum(["name_asc", "rating_desc", "price_asc"]).default("name_asc"),
});

module.exports = {
  emptyQuery,
  idParams,
  loginBody,
  objectId,
  pageQuery,
  profileBody,
  profileIdParams,
  profileQuery,
  refreshBody,
  registerBody,
  requestBody,
  requestQuery,
  reviewBody,
  reviewQuery,
  reviewUpdateBody,
  savedQuery,
  statusBody,
};
