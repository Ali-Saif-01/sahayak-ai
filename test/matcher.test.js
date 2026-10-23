import test from "node:test";
import assert from "node:assert/strict";
import { findMatches } from "../lib/matcher.js";

const baseProfile = {
  age: 24, gender: "prefer-not-to-say", state: "maharashtra",
  category: "prefer-not-to-say", annualIncome: 250000,
  occupation: "student", hasDisability: false, hasGirlChild: false,
  ownsLand: false, hasHealthCover: false, ruralResident: false
};

test("returns student scholarship signpost and explains matched criteria", () => {
  const results = findMatches(baseProfile);
  const scholarship = results.find((x) => x.id === "national-scholarship-portal");
  assert.ok(scholarship);
  assert.ok(scholarship.score > 0);
  assert.ok(scholarship.metCriteria.some((x) => x.label === "Student"));
  assert.match(scholarship.officialUrl, /^https:\/\/scholarships\.gov\.in/);
});

test("farmer with land sees PM-KISAN signpost", () => {
  const results = findMatches({ ...baseProfile, occupation: "farmer", ownsLand: true });
  const scheme = results.find((x) => x.id === "pm-kisan");
  assert.equal(scheme?.score, 100);
  assert.equal(scheme?.status, "Potential fit");
});

test("a student without land does not get PM-KISAN from this rule set", () => {
  const results = findMatches(baseProfile);
  assert.equal(results.some((x) => x.id === "pm-kisan"), false);
});

test("disability support signpost appears only when relevant answer is true", () => {
  const no = findMatches(baseProfile);
  const yes = findMatches({ ...baseProfile, hasDisability: true });
  assert.equal(no.some((x) => x.id === "disability-support"), false);
  assert.equal(yes.some((x) => x.id === "disability-support"), true);
});

test("all returned results include a source and a document checklist", () => {
  for (const item of findMatches(baseProfile)) {
    assert.match(item.officialUrl, /^https:\/\/.+/);
    assert.ok(Array.isArray(item.documents) && item.documents.length > 0);
    assert.ok(Array.isArray(item.metCriteria));
    assert.ok(Array.isArray(item.unmetCriteria));
  }
});
