
import schemes from "../data/schemes.json" with { type: "json" };

const predicates = {
  occupation: (profile) => profile.occupation === "farmer",
  ownsLand: (profile) => profile.ownsLand,
  state: (profile) =>
    typeof profile.state === "string" && profile.state.length > 0,
  noHealthCover: (profile) => !profile.hasHealthCover,
  student: (profile) => profile.occupation === "student",
  incomeKnown: (profile) =>
    Number.isFinite(profile.annualIncome) && profile.annualIncome >= 0,
  age60: (profile) => profile.age >= 60,
  girlChild: (profile) => profile.hasGirlChild,
  disability: (profile) => profile.hasDisability
};

export function findMatches(profile) {
  const results = schemes.map((scheme) => {
    const metCriteria = [];
    const unmetCriteria = [];

    for (const rule of scheme.rules) {
      const predicate = predicates[rule.test];

      if (typeof predicate !== "function") {
        throw new Error(
          `Unknown rule "${rule.test}" in resource "${scheme.id}"`
        );
      }

      const criterion = {
        label: rule.label,
        explanation: rule.explanation
      };

      if (predicate(profile)) {
        metCriteria.push(criterion);
      } else {
        unmetCriteria.push(criterion);
      }
    }

    return {
      id: scheme.id,
      name: scheme.name,
      summary: scheme.summary,
      category: scheme.category,
      officialUrl: scheme.officialUrl,
      sourceLabel: scheme.sourceLabel,
      documents: scheme.documents,
      note: scheme.note,
      metCriteria,
      unmetCriteria,
      status: "Resource to explore"
    };
  });

  return results
    .filter((item) => item.metCriteria.length > 0)
    .sort(
      (a, b) =>
        b.metCriteria.length - a.metCriteria.length ||
        a.name.localeCompare(b.name)
    );
}
