
import test from "node:test";
import assert from "node:assert/strict";
import { findMatches } from "../lib/matcher.js";

const baseProfile = {
  age: 24,
  gender: "prefer-not-to-say",
  state: "maharashtra",
  category: "prefer-not-to-say",
  annualIncome: 250000,
  occupation: "student",
  hasDisability: false,
  hasGirlChild: false,
  ownsLand: false,
  hasHealthCover: false,
  ruralResident: false
};

test("returns scholarship discovery suggestion for a student", () => {
  const results = findMatches(baseProfile);
  const scholarship = results.find(
    (item) => item.id === "national-scholarship-portal"
  );

  assert.ok(scholarship);
  assert.ok(scholarship.metCriteria.some(
    (item) => item.label === "Student"
  ));
  assert.equal(scholarship.status, "Resource to explore");
  assert.equal("score" in scholarship, false);
});

test("farmer with land sees PM-KISAN as a discovery suggestion", () => {
  const results = findMatches({
    ...baseProfile,
    occupation: "farmer",
    ownsLand: true
  });

  const scheme = results.find((item) => item.id === "pm-kisan");

  assert.ok(scheme);
  assert.equal(scheme.metCriteria.length, 2);
  assert.equal(scheme.unmetCriteria.length, 0);
  assert.equal(scheme.status, "Resource to explore");
});

test("student without land does not receive the PM-KISAN signpost", () => {
  const results = findMatches(baseProfile);

  assert.equal(
    results.some((item) => item.id === "pm-kisan"),
    false
  );
});

test("disability support appears when the relevant answer is true", () => {
  const withoutDisability = findMatches(baseProfile);
  const withDisability = findMatches({
    ...baseProfile,
    hasDisability: true
  });

  assert.equal(
    withoutDisability.some((item) => item.id === "disability-support"),
    false
  );
  assert.equal(
    withDisability.some((item) => item.id === "disability-support"),
    true
  );
});

test("all results include official sources and document lists", () => {
  for (const item of findMatches(baseProfile)) {
    assert.match(item.officialUrl, /^https:\/\/.+/);
    assert.ok(Array.isArray(item.documents) && item.documents.length > 0);
    assert.ok(Array.isArray(item.metCriteria));
    assert.ok(Array.isArray(item.unmetCriteria));
    assert.equal(item.status, "Resource to explore");
  }
});

test("results are sorted by matched signpost count", () => {
  const results = findMatches({
    ...baseProfile,
    occupation: "farmer",
    ownsLand: true
  });

  for (let i = 1; i < results.length; i++) {
    assert.ok(
      results[i - 1].metCriteria.length >=
      results[i].metCriteria.length
    );
  }
});
