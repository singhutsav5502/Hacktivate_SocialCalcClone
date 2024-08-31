import DiffMatchPatch from 'diff-match-patch';

const dmp = new DiffMatchPatch();

export const computeDelta = (oldValue, newValue) => {
  const diffs = dmp.diff_main(oldValue, newValue); // Compute the difference
  dmp.diff_cleanupEfficiency(diffs); // Clean up the diff for efficiency
  const patch = dmp.patch_make(oldValue, diffs); // Generate the patch
  return patch;
};