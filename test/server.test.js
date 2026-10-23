import test from "node:test";
import assert from "node:assert/strict";
import { app, server } from "../server.js";

let baseUrl;
test("start test server", async () => {
  await new Promise((resolve) => {
    if (server.listening) return resolve();
    server.once("listening", resolve);
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test("health endpoint responds", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, "ok");
});

test("matches endpoint rejects missing or invalid profile fields", async () => {
  const response = await fetch(`${baseUrl}/api/matches`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ age: -2 })
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.ok(Array.isArray(body.details));
});

test("matches endpoint accepts a valid profile", async () => {
  const response = await fetch(`${baseUrl}/api/matches`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      age: 21, gender: "woman", state: "maharashtra", category: "prefer-not-to-say",
      annualIncome: 180000, occupation: "student", hasDisability: false,
      hasGirlChild: false, ownsLand: false, hasHealthCover: false, ruralResident: false
    })
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(Array.isArray(body.results));
  assert.ok(body.disclaimer);
});

test("stop test server", async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});
