/**
 * Minimum bundle booking using bottom-up coin-change DP.
 * Written from scratch — no library.
 *
 * @param {number[]} bundleSizes - available bundle sizes (like coin denominations)
 * @param {number} groupSize - target number of seats (like the target amount)
 * @returns {{ possible: boolean, totalBundles?: number, bundles?: Array<{size: number, count: number}>, groupSize: number }}
 */
function calculateMinBundles(bundleSizes, groupSize) {
  if (groupSize === 0) {
    return { possible: true, totalBundles: 0, bundles: [], groupSize };
  }

  const INF = groupSize + 1;

  // dp[i] = minimum number of bundles to make exactly i seats
  const dp = new Array(groupSize + 1).fill(INF);
  // track which bundle size was used at each step for backtracking
  const usedBundle = new Array(groupSize + 1).fill(-1);

  dp[0] = 0;

  for (let i = 1; i <= groupSize; i++) {
    for (const size of bundleSizes) {
      if (size <= i && dp[i - size] + 1 < dp[i]) {
        dp[i] = dp[i - size] + 1;
        usedBundle[i] = size;
      }
    }
  }

  if (dp[groupSize] === INF) {
    return { possible: false, groupSize };
  }

  // Backtrack to find which bundles were used
  const bundleCounts = new Map();
  let remaining = groupSize;

  while (remaining > 0) {
    const size = usedBundle[remaining];
    bundleCounts.set(size, (bundleCounts.get(size) || 0) + 1);
    remaining -= size;
  }

  // Convert to sorted array
  const bundles = [];
  for (const [size, count] of bundleCounts) {
    bundles.push({ size, count });
  }
  bundles.sort((a, b) => a.size - b.size);

  const totalBundles = bundles.reduce((sum, b) => sum + b.count, 0);

  return { possible: true, totalBundles, bundles, groupSize };
}

module.exports = { calculateMinBundles };
