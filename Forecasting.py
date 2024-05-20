import pandas as pd
from matplotlib import pyplot as plt
from prophet import Prophet
from sklearn.metrics import mean_absolute_error
from RemoveOutliers import Remove_Suspect, Remove_Outlier_Indices, iqr_method


def prophet_forecast(input_df):
    # Clean and prepare the data
    df = Remove_Suspect(input_df.df)
    df = iqr_method(df)
    df = df[['Timestamp', 'Value']]
    df.columns = ['ds', 'y']
    df['ds'] = pd.to_datetime(df['ds'])

    train_size = int(0.8 * len(df))
    train_df = df.iloc[:train_size]
    test_df = df.iloc[train_size:]

    model = Prophet(seasonality_mode='multiplicative', changepoint_prior_scale=0.5, yearly_seasonality=10, weekly_seasonality=True)
    model.fit(train_df)

    future = model.make_future_dataframe(periods=len(test_df), freq='H')
    forecast = model.predict(future)

    mae = mean_absolute_error(test_df['y'], forecast['yhat'].tail(len(test_df)))

    return forecast, mae
