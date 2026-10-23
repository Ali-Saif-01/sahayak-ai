import schemes from "../data/schemes.json" with { type: "json" };

const predicates = {
  occupation: (p) => p.occupation === "farmer",
  ownsLand: (p) => p.ownsLand,
  state: (p) => typeof p.state === "string" && p.state.length > 0,
  noHealthCover: (p) => !p.hasHealthCover,
  student: (p) => p.occupation === "student",
  incomeKnown: (p) => Number.isFinite(p.annualIncome) && p.annualIncome >= 0,
  age60: (p) => p.age >= 60,
  girlChild: (p) => p.hasGirlChild,
  disability: (p) => p.hasDisability
};

export function findMatches(profile) {
  return schemes.map((scheme) => {
    const checks = scheme.rules.map((rule) => ({
      label: rule.label,
      met: Boolean(predicates[rule.test]?.(profile)),
      explanation: rule.explanation
    }));
    const met = checks.filter((item) => item.met);
    const unmet = checks.filter((item) => !item.met);
    const score = checks.length ? Math.round((met.length / checks.length) * 100) : 0;
    return {
      id: scheme.id,
      name: scheme.name,
      summary: scheme.summary,
      category: scheme.category,
      officialUrl: scheme.officialUrl,
      sourceLabel: scheme.sourceLabel,
      documents: scheme.documents,
      note: scheme.note,
      score,
      metCriteria: met.map(({ label, explanation }) => ({ label, explanation })),
      unmetCriteria: unmet.map(({ label, explanation }) => ({ label, explanation })),
      status: unmet.length === 0 ? "Potential fit" : met.length > 0 ? "Needs checking" : "May not fit"
    };
  }).filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}
