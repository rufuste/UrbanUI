import pandas as pd
from matplotlib import pyplot as plt
from prophet import Prophet
from sklearn.metrics import mean_absolute_error
from RemoveOutliers import Remove_Suspect, Remove_Outlier_Indices, iqr_method


def prophet_forecast(input_df):
    """
    Performs a forecast on time-series data using Facebook's Prophet model after cleaning and preparing the data.

    Parameters:
    - input_df (DataFrame): The DataFrame containing the time-series data with columns 'Timestamp' and 'Value'.

    Returns:
    - float: The Mean Absolute Error (MAE) of the forecast against the test dataset, providing an indication of the prediction accuracy.

    Notes:
    - The function assumes the DataFrame has been preprocessed to remove suspect data and outliers.
    - It splits the data into 80% for training and 20% for testing, then fits a Prophet model to predict future values.
    """

    # Clean and prepare the data
    df = Remove_Suspect(input_df.df)
    df = iqr_method(df)
    # Select relevant columns and rename them as required by Prophet
    df = df[['Timestamp', 'Value']]
    df.columns = ['ds', 'y']

    # Make sure the 'ds' column is in datetime format
    df['ds'] = pd.to_datetime(df['ds'])

    # Split the data into train and test sets (80% train, 20% test)
    train_size = int(0.8 * len(df))
    train_df = df.iloc[:train_size]
    test_df = df.iloc[train_size:]

    # Initialize and fit the Prophet model with tuned hyperparameters
    model = Prophet(seasonality_mode='multiplicative', changepoint_prior_scale=0.5, yearly_seasonality=10,
                    weekly_seasonality=True)
    model.fit(train_df)

    # Make predictions for the test set
    future = model.make_future_dataframe(periods=len(test_df), freq='H')
    forecast = model.predict(future)

    # Plot the predictions
    fig = model.plot(forecast)

    # Set the Y-axis label
    ax = fig.gca()
    ax.set_ylabel(str(input_df) + ' Measurement Value')

    # Optionally, you can set the X-axis label as well
    ax.set_xlabel('Time')

    plt.show()

    # Calculate the Mean Absolute Error (MAE) to evaluate the model's performance
    mae = mean_absolute_error(test_df['y'], forecast['yhat'].tail(len(test_df)))
    print(f"Mean Absolute Error: {mae:.2f}")

    return mae
