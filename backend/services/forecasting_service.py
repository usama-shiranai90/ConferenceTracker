from statsmodels.tsa.holtwinters import ExponentialSmoothing
import pandas as pd
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class ForecastingService:
    def forecast_topic_trend(self, time_series: pd.Series, periods: int = 12) -> Dict[str, Any]:
        """
        FR-3.2.1: Time-Series Prediction
        Note: Using Exponential Smoothing (Holt-Winters) as a robust alternative to ARIMA/Prophet
        that works well with smaller datasets and is lightweight. Prophet can be added if requirements strictly demand.
        """
        if len(time_series) < 12:
             # Need enough data for seasonality
             return {"error": "Insufficient data"}
             
        try:
            # Additive trend and seasonality
            model = ExponentialSmoothing(
                time_series, 
                seasonal_periods=12, 
                trend='add', 
                seasonal='add'
            ).fit()
            
            forecast = model.forecast(periods)
            
            return {
                "forecast_dates": forecast.index.strftime('%Y-%m-%d').tolist(),
                "forecast_values": forecast.values.tolist(),
                "model_params": model.params
            }
        except Exception as e:
            logger.error(f"Forecasting failed: {e}")
            return {"error": str(e)}
