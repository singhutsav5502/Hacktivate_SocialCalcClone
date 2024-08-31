import { create, all } from 'mathjs';

const math = create(all);

export const evaluateFormula = (formula, cellValues) => {
  // Extract all cell references like A1, B2, etc.
  const regex = /[A-Z][0-9]+/g;
  const cellReferences = formula.match(regex) || [];

  // Replace cell references with their values from `cellValues`
  cellReferences.forEach((ref) => {
    const value = cellValues[ref] || 0; // Default to 0 if the cell is empty
    formula = formula.replace(ref, value);
  });

  try {
    return math.evaluate(formula); // Evaluate the mathematical expression
  } catch (error) {
    return 'Error'; // Return an error if formula parsing fails
  }
};
