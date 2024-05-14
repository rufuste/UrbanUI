import pandas as pd

def Remove_Suspect(df):
    """
    Cleans a DataFrame by removing suspect or invalid data.

    Parameters:
    - df (DataFrame): The DataFrame to clean, which must include the columns 'Value' and 'Flagged as Suspect Reading'.

    Returns:
    - DataFrame: A cleaned DataFrame with NaN values and suspect readings removed.
    """

    # Drop rows containing NaN values
    df.dropna(inplace=True)

    # Remove rows with 'Value' <= 0
    df = df[df['Value'] > 0]

    # Remove flagged as suspect readings
    df = df[df['Flagged as Suspect Reading'] == False]

    return df


def Remove_Outlier_Indices(df):
    """
    Identifies indices in a DataFrame that do not contain outliers based on the Interquartile Range (IQR) method.

    Parameters:
    - df (DataFrame): DataFrame from which outliers are to be identified.

    Returns:
    - DataFrame: A boolean DataFrame where True indicates non-outlier data points.
    """
    if 'Value' not in df.columns:
        raise ValueError("DataFrame must contain 'Value' column")

    Q1 = df['Value'].quantile(0.25)
    Q3 = df['Value'].quantile(0.75)
    IQR = Q3 - Q1
    trueList = ~((df['Value'] < (Q1 - 1.5 * IQR)) | (df['Value'] > (Q3 + 1.5 * IQR)))
    return trueList

def iqr_method(df):
    """
    Filters a DataFrame to remove outliers using the Interquartile Range (IQR) method.

    Parameters:
    - df (DataFrame): The DataFrame from which outliers are to be removed. It must include a 'Value' column.

    Returns:
    - DataFrame: A DataFrame containing only the non-outlier entries from the original DataFrame.
    """
    nonOutliers = Remove_Outlier_Indices(df)

    # Non-Outlier Subset of the Given Dataset
    dfIQR = df[nonOutliers]
    return dfIQR


