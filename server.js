import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findMatches } from "./lib/matcher.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(express.static(path.join(__dirname, "public"), {
  etag: true,
  maxAge: process.env.NODE_ENV === "production" ? "1h" : 0
}));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Sahayak AI" });
});

app.post("/api/matches", (req, res) => {
  const validation = validateProfile(req.body);
  if (!validation.ok) {
    return res.status(400).json({
      error: "Please check the highlighted details and try again.",
      details: validation.errors
    });
  }

  try {
    const result = findMatches(validation.profile);
    return res.json({ results: result, disclaimer: "These results are a starting point, not an eligibility decision. Check current rules on the official scheme website." });
  } catch {
    return res.status(500).json({ error: "We couldn't assess matches right now. Please try again later." });
  }
});

app.use((err, _req, res, _next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: "The request is too large. Please shorten your answers." });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "The request format was invalid." });
  }
  return res.status(500).json({ error: "Something went wrong. Please try again." });
});

function validateProfile(body) {
  const errors = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, errors: ["Please submit your details using the form."] };
  }

  const age = Number(body.age);
  if (!Number.isInteger(age) || age < 0 || age > 120) errors.push("Age must be a whole number from 0 to 120.");

  const allowedGenders = ["woman", "man", "another", "prefer-not-to-say"];
  if (!allowedGenders.includes(body.gender)) errors.push("Choose a gender option.");

  const allowedStates = ["andhra-pradesh","arunachal-pradesh","assam","bihar","chhattisgarh","goa","gujarat","haryana","himachal-pradesh","jharkhand","karnataka","kerala","madhya-pradesh","maharashtra","manipur","meghalaya","mizoram","nagaland","odisha","punjab","rajasthan","sikkim","tamil-nadu","telangana","tripura","uttar-pradesh","uttarakhand","west-bengal","delhi","jammu-and-kashmir","ladakh","puducherry","andaman-and-nicobar","chandigarh","dadra-and-nagar-haveli-and-daman-and-diu","lakshadweep"];
  if (!allowedStates.includes(body.state)) errors.push("Choose a state or union territory.");

  const allowedCategories = ["general","sc","st","obc","other","prefer-not-to-say"];
  if (!allowedCategories.includes(body.category)) errors.push("Choose a social category option.");

  const income = Number(body.annualIncome);
  if (!Number.isFinite(income) || income < 0 || income > 1000000000) errors.push("Annual household income must be a valid non-negative amount.");

  const allowedOccupations = ["student","farmer","salaried","self-employed","unemployed","homemaker","other"];
  if (!allowedOccupations.includes(body.occupation)) errors.push("Choose an occupation.");

  const booleanFields = ["hasDisability","hasGirlChild","ownsLand","hasHealthCover","ruralResident"];
  for (const key of booleanFields) {
    if (typeof body[key] !== "boolean") errors.push(`Please answer the ${key} question.`);
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, profile: { age, gender: body.gender, state: body.state, category: body.category, annualIncome: income, occupation: body.occupation, hasDisability: body.hasDisability, hasGirlChild: body.hasGirlChild, ownsLand: body.ownsLand, hasHealthCover: body.hasHealthCover, ruralResident: body.ruralResident } };
}

const server = app.listen(PORT, () => {
  console.log(`Sahayak AI running at http://localhost:${PORT}`);
});

export { app, server };
