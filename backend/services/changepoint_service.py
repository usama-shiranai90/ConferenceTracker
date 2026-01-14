import ruptures as rpt
import numpy as np
import pandas as pd
from scipy import stats
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class ChangepointService:
    def detect_changepoints(self, time_series: List[float], dates: List[pd.Timestamp]) -> List[Dict[str, Any]]:
        """
        FR-3.1.1: Statistical Changepoint Detection
        Uses PELT algorithm to detect mean shifts.
        """
        if len(time_series) < 10:
            logger.warning("Not enough data points for changepoint detection.")
            return []

        signal = np.array(time_series)
        
        # FR-3.1.1: Apply PELT algorithm
        # "rbf" model allows detecting non-linear changes (Kernel-based)
        algo = rpt.Pelt(model="rbf").fit(signal)
        try:
            # Penalty selection is heuristic; 2*log(n) is standard-ish like AIC
            result_indices = algo.predict(pen=10)
        except Exception as e:
            logger.error(f"PELT prediction failed: {e}")
            return []

        changepoints = []
        
        # result_indices are the end indices of segments.
        # We want the start of the new segment (changepoint location).
        
        previous_idx = 0
        for idx in result_indices[:-1]: # Last index is usually end of signal
            if idx >= len(dates):
                continue
                
            cp_date = dates[idx]
            
            # FR-3.1.1: Validate using t-test (p-value < 0.05)
            # Compare mean of segment before vs segment after
            # Define window size for comparison (e.g., 5 points or full segment)
            seg_before = signal[previous_idx:idx]
            # Next segment end
            next_idx_in_result = [i for i in result_indices if i > idx]
            next_idx = next_idx_in_result[0] if next_idx_in_result else len(signal)
            seg_after = signal[idx:next_idx]

            if len(seg_before) > 2 and len(seg_after) > 2:
                t_stat, p_val = stats.ttest_ind(seg_before, seg_after, equal_var=False)
                is_significant = p_val < 0.05
            else:
                is_significant = False # Not enough data to validate

            if is_significant:
                classification = self._classify_changepoint(seg_before, seg_after)
                changepoints.append({
                    "date": cp_date,
                    "index": idx,
                    "type": classification,
                    "p_value": p_val,
                    "mean_before": np.mean(seg_before),
                    "mean_after": np.mean(seg_after)
                })
            
            previous_idx = idx
            
        return changepoints

    def _classify_changepoint(self, before: np.ndarray, after: np.ndarray) -> str:
        """
        FR-3.1.2: Changepoint Classification
        """
        mean_before = np.mean(before)
        mean_after = np.mean(after)
        
        # Avoid division by zero
        if mean_before == 0:
            pct_change = 10.0 if mean_after > 0 else 0.0
        else:
            pct_change = (mean_after - mean_before) / mean_before

        if mean_before == 0 and mean_after > 0:
            return "Emergence" # 0 papers -> sustained growth
        
        if pct_change > 2.0: # > 200% increase (~3x)
            return "Explosion"
        
        if pct_change > 0.5:
            return "Shift"
        
        if pct_change < -0.3:
            return "Decline"
            
        # "Plateau" is harder to define with just two means, usually implies 
        # Growth -> Flat. Requires looking at slope (derivative). 
        # Simplified here as small change relative to variance.
        return "Plateau" if abs(pct_change) < 0.1 else "Shift"

    def detect_crossovers(self, topic_a_series: pd.Series, topic_b_series: pd.Series) -> List[Dict]:
        """
        FR-3.1.3: Paradigm Shift Detection (Crossover events)
        topic_a_series and topic_b_series should be aligned by date index.
        """
        crossovers = []
        diff = topic_a_series - topic_b_series
        
        # Check sign changes
        sign_changes = np.where(np.diff(np.sign(diff)))[0]
        
        for idx in sign_changes:
            date = diff.index[idx]
            # Determine winner
            winner = "Topic A" if diff.iloc[idx+1] > 0 else "Topic B"
            loser = "Topic B" if winner == "Topic A" else "Topic A"
            
            crossovers.append({
                "date": date,
                "event": f"{winner} overtook {loser}",
                "magnitude": abs(diff.iloc[idx+1])
            })
            
        return crossovers
