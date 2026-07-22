// lib/grading.js

export function calculateNLSCGrade(caInput, caMax = 20, eocInput, eocMax = 100) {
  // Validate ranges
  if (caInput < 0 || caInput > caMax) {
    throw new Error(`CA score must be between 0 and ${caMax}`);
  }
  if (eocInput < 0 || eocInput > eocMax) {
    throw new Error(`End of Cycle score must be between 0 and ${eocMax}`);
  }

  // Calculate weighted contributions
  const caContribution = Number(((caInput / caMax) * 20).toFixed(2));
  const eocContribution = Number(((eocInput / eocMax) * 80).toFixed(2));
  const totalScore = Math.round(caContribution + eocContribution);

  // Map to UNEB Grade Descriptors
  let result = {
    caContribution,
    eocContribution,
    totalScore,
    grade: 'E',
    points: 1,
    descriptor: 'Elementary',
    definition: 'Demonstrates below basic competency level.'
  };

  if (totalScore >= 80) {
    result.grade = 'A';
    result.points = 5;
    result.descriptor = 'Exceptional';
    result.definition = 'Demonstrates extraordinary competency by applying skills innovatively.';
  } else if (totalScore >= 70) {
    result.grade = 'B';
    result.points = 4;
    result.descriptor = 'Outstanding';
    result.definition = 'Demonstrates a high level of competency in practical situations.';
  } else if (totalScore >= 60) {
    result.grade = 'C';
    result.points = 3;
    result.descriptor = 'Satisfactory';
    result.definition = 'Demonstrates adequate competency in applying knowledge.';
  } else if (totalScore >= 50) {
    result.grade = 'D';
    result.points = 2;
    result.descriptor = 'Basic';
    result.definition = 'Demonstrates minimum level of competency.';
  }

  return result;
}