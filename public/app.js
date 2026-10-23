const states = [
  ["andhra-pradesh","Andhra Pradesh"],["arunachal-pradesh","Arunachal Pradesh"],["assam","Assam"],["bihar","Bihar"],["chhattisgarh","Chhattisgarh"],["goa","Goa"],["gujarat","Gujarat"],["haryana","Haryana"],["himachal-pradesh","Himachal Pradesh"],["jharkhand","Jharkhand"],["karnataka","Karnataka"],["kerala","Kerala"],["madhya-pradesh","Madhya Pradesh"],["maharashtra","Maharashtra"],["manipur","Manipur"],["meghalaya","Meghalaya"],["mizoram","Mizoram"],["nagaland","Nagaland"],["odisha","Odisha"],["punjab","Punjab"],["rajasthan","Rajasthan"],["sikkim","Sikkim"],["tamil-nadu","Tamil Nadu"],["telangana","Telangana"],["tripura","Tripura"],["uttar-pradesh","Uttar Pradesh"],["uttarakhand","Uttarakhand"],["west-bengal","West Bengal"],["delhi","Delhi"],["jammu-and-kashmir","Jammu and Kashmir"],["ladakh","Ladakh"],["puducherry","Puducherry"],["andaman-and-nicobar","Andaman and Nicobar Islands"],["chandigarh","Chandigarh"],["dadra-and-nagar-haveli-and-daman-and-diu","Dadra and Nagar Haveli and Daman and Diu"],["lakshadweep","Lakshadweep"]
];
const form = document.querySelector("#profile-form");
const stateSelect = document.querySelector("#state");
const resultsSection = document.querySelector("#results-section");
const resultsGrid = document.querySelector("#results-grid");
const resultsStatus = document.querySelector("#results-status");
const resultsSummary = document.querySelector("#results-summary");
document.querySelector("#year").textContent = new Date().getFullYear();

for (const [value, label] of states) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  stateSelect.append(option);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.querySelector("span:first-child").textContent = "Finding possible matches…";
  resultsStatus.textContent = "Checking the details you provided…";
  resultsSection.hidden = false;
  resultsGrid.replaceChildren();
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });

  const formData = new FormData(form);
  const profile = {
    age: Number(formData.get("age")),
    gender: formData.get("gender"),
    state: formData.get("state"),
    category: formData.get("category"),
    annualIncome: Number(formData.get("annualIncome")),
    occupation: formData.get("occupation"),
    ownsLand: formData.has("ownsLand"),
    hasDisability: formData.has("hasDisability"),
    hasGirlChild: formData.has("hasGirlChild"),
    hasHealthCover: formData.has("hasHealthCover"),
    ruralResident: formData.has("ruralResident")
  };

  try {
    const response = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(Array.isArray(data.details) ? data.details.join(" ") : data.error || "Unable to search right now.");
    }
    renderResults(data.results);
  } catch (error) {
    resultsStatus.textContent = error.message || "We couldn't complete the search. Please try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span:first-child").textContent = "Explore possible matches";
  }
});

document.querySelector("#edit-profile").addEventListener("click", () => {
  document.querySelector("#main").scrollIntoView({ behavior: "smooth" });
  document.querySelector("#age").focus({ preventScroll: true });
});

function renderResults(results) {
  resultsGrid.replaceChildren();
  resultsSummary.textContent = `${results.length} resource${results.length === 1 ? "" : "s"} to explore, based on your answers.`;
  resultsStatus.textContent = results.length
    ? "These are signposts to help you investigate — not official eligibility decisions."
    : "No results were triggered by these answers in our small demo dataset. Try the official myScheme portal for a broader search.";

  for (const item of results) {
    const card = document.createElement("article");
    card.className = "result-card";

    const top = document.createElement("div");
    top.className = "result-top";
    top.append(makeTag(item.category, "category-tag"));
    const score = makeTag(`${item.score}% signposts matched`, "score-tag");
    top.append(score);
    card.append(top);

    const title = document.createElement("h3");
    title.textContent = item.name;
    card.append(title);

    const summary = document.createElement("p");
    summary.textContent = item.summary;
    card.append(summary);

    const status = document.createElement("p");
    status.className = item.status === "Potential fit" ? "match-good" : item.status === "Needs checking" ? "match-check" : "match-bad";
    status.innerHTML = "<strong></strong>";
    status.querySelector("strong").textContent = item.status;
    card.append(status);

    card.append(makeDetails("Why it appeared", item.metCriteria.map((x) => `${x.label}: ${x.explanation}`), "No signposts matched in this dataset."));
    card.append(makeDetails("What to verify", item.unmetCriteria.map((x) => `${x.label}: ${x.explanation}`), "All listed signposts matched, but official eligibility still needs verification."));
    card.append(makeDetails("Documents to prepare", item.documents, "Check the official source for required documents."));

    const link = document.createElement("a");
    link.className = "official-link";
    link.href = item.officialUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.append(document.createTextNode(item.sourceLabel));
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = " ↗";
    link.append(arrow);
    card.append(link);

    const note = document.createElement("p");
    note.className = "source-note muted";
    note.textContent = item.note;
    card.append(note);
    resultsGrid.append(card);
  }
}

function makeTag(text, className) {
  const tag = document.createElement("span");
  tag.className = className;
  tag.textContent = text;
  return tag;
}

function makeDetails(label, items, emptyText) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = label;
  details.append(summary);
  const list = document.createElement("ul");
  const values = items.length ? items : [emptyText];
  for (const value of values) {
    const li = document.createElement("li");
    li.textContent = value;
    list.append(li);
  }
  details.append(list);
  return details;
}
