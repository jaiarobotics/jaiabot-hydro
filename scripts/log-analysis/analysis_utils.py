### IMPORTS ###
import h5py

import numpy as np
import pandas as pd
import plotly.graph_objects as go

from pathlib import Path
from contextlib import contextmanager


### DATA ACQUISITION ###
def get_current_data(file: h5py.File):
    utime = np.array(file["/jaiabot::arduino_to_pi/jaiabot.protobuf.ArduinoResponse/_utime_"])
    current = np.array(file["/jaiabot::arduino_to_pi/jaiabot.protobuf.ArduinoResponse/vcccurrent"])
    
    return pd.DataFrame({'utime': utime, 'current': current})

def get_RPM_data(file: h5py.File):
    utime = np.array(file["/jaiabot::motor_status/jaiabot.protobuf.Motor/_utime_"])
    rpm = np.array(file["/jaiabot::motor_status/jaiabot.protobuf.Motor/rpm"])
    
    return pd.DataFrame({'utime': utime, 'rpm': rpm})

def get_speedOverGround_data(file: h5py.File):
    utime = np.array(file["/jaiabot::bot_status;12/jaiabot.protobuf.BotStatus/_utime_"])
    speed = np.array(file["/jaiabot::bot_status;12/jaiabot.protobuf.BotStatus/speed/over_ground"])
    
    return pd.DataFrame({'utime': utime, 'speed': speed})



### DATA ANALYSIS ###
def get_max_value(df: pd.DataFrame, dataset: str) -> float: #Max value of a dataset
    return df[dataset].max()

def get_min_value(df: pd.DataFrame, dataset: str) -> float: #Min value of a dataset
    return df[dataset].min()

def get_mean_value(df: pd.DataFrame, dataset: str) -> float: #Mean value of a dataset
    return df[dataset].mean()

def get_median_value(df: pd.DataFrame, dataset: str) -> float: #Median value of a dataset
    return df[dataset].median()

def get_std_dev_value(df: pd.DataFrame, dataset: str) -> float: #Standard deviation of a dataset 
    return df[dataset].std()



### DATA VISUALIZATION ###
def plot_2_series(df: pd.DataFrame,
                 x_axis: str,
                 y_axis: str,
                 title: str = None,
                 x_label: str = None,
                 y_label: str = None) -> go.Figure:
    """
    Creates a Plotly 2D plot from a DataFrame using specified columns.
    
    Args:
        df: Input DataFrame containing the data
        x_axis: Column name to use for x-axis
        y_axis: Column name to use for y-axis
        title: Optional plot title
        x_label: Optional x-axis label (defaults to x_axis if None)
        y_label: Optional y-axis label (defaults to y_axis if None)
    
    Returns:
        Plotly Figure object
    """
    # Input validation
    if x_axis not in df.columns:
        raise ValueError(f"Column '{x_axis}' not found in DataFrame")
    if y_axis not in df.columns:
        raise ValueError(f"Column '{y_axis}' not found in DataFrame")
    
    # Create figure
    fig = go.Figure()
    
    # Add scatter plot
    fig.add_trace(
        go.Scatter(
            x=df[x_axis],
            y=df[y_axis],
            mode='lines',
            name=y_axis
        )
    )
    
    # Update layout
    fig.update_layout(
        title=title or f"{y_axis} vs {x_axis}",
        xaxis_title=x_label or x_axis,
        yaxis_title=y_label or y_axis,
        template='plotly_white',  # Clean, professional template
        showlegend=True,
        hovermode='x unified'
    )
    
    # Add grid lines and improve appearance
    fig.update_xaxes(showgrid=True, gridwidth=1, gridcolor='LightGray')
    fig.update_yaxes(showgrid=True, gridwidth=1, gridcolor='LightGray')
    
    return fig

def plot_series_x_time(df: pd.DataFrame,
                    y_axis: str,
                    title: str = None,
                    y_label: str = None) -> go.Figure:
    """
    Creates a Plotly 2D plot from a DataFrame using specified columns.
    
    Args:
        df: Input DataFrame containing the data
        x_axis: Column name to use for x-axis
        y_axis: Column name to use for y-axis
        title: Optional plot title
        x_label: Optional x-axis label (defaults to x_axis if None)
        y_label: Optional y-axis label (defaults to y_axis if None)
    
    Returns:
        Plotly Figure object
    """
    # Input validation
    if y_axis not in df.columns:
        raise ValueError(f"Column '{y_axis}' not found in DataFrame")
    
    # Create figure
    fig = go.Figure()
    
    # Add scatter plot
    fig.add_trace(
        go.Scatter(
            x=df['utime'],
            y=df[y_axis],
            mode='lines',
            name=y_axis
        )
    )
    
    # Update layout
    fig.update_layout(
        title=title or f"{y_axis} vs {'utime'}",
        xaxis_title="utime",
        yaxis_title=y_label or y_axis,
        template='plotly_white',  # Clean, professional template
        showlegend=True,
        hovermode='x unified'
    )
    
    # Add grid lines and improve appearance
    fig.update_xaxes(showgrid=True, gridwidth=1, gridcolor='LightGray')
    fig.update_yaxes(showgrid=True, gridwidth=1, gridcolor='LightGray')
    
    return fig 



### DATA CLEANING ###
def combine_data(dataframes: list[pd.DataFrame], 
                join_type: str = 'outer',
                drop_duplicates: bool = False) -> pd.DataFrame:
    """
    Combines multiple pandas DataFrames based on utime column, forward-filling missing values.
    
    Args:
        dataframes: List of pandas DataFrames, each containing a 'utime' column
        join_type: Type of join operation ('outer', 'inner', 'left', 'right')
        drop_duplicates: Whether to remove duplicate rows
    
    Returns:
        Combined DataFrame aligned on utime with forward-filled values
    """
    # Input validation
    if not dataframes:
        raise ValueError("No DataFrames provided")
    
    # Verify each DataFrame has a utime column
    for i, df in enumerate(dataframes):
        if 'utime' not in df.columns:
            raise ValueError(f"DataFrame at index {i} is missing 'utime' column")
    
    # Find the DataFrame with the longest time series
    longest_df = max(dataframes, key=len)
    target_utimes = longest_df['utime']
    
    # Prepare DataFrames for merging
    aligned_dfs = []
    for df in dataframes:
        # Set utime as index for proper alignment
        df = df.set_index('utime')
        
        # Reindex to match target utimes and forward fill
        aligned_df = df.reindex(target_utimes, method='ffill')
        
        # Reset index to keep utime as a column
        aligned_df = aligned_df.reset_index()
        aligned_dfs.append(aligned_df)
    
    # Combine DataFrames side by side, keeping only one utime column
    result = aligned_dfs[0]
    for df in aligned_dfs[1:]:
        result = pd.merge(result, df.drop('utime', axis=1), 
                         left_index=True, right_index=True,
                         how=join_type)
    
    if drop_duplicates:
        result.drop_duplicates(inplace=True)
    
    return result

def filter_by_mission_state(dataframes: list[pd.DataFrame],
                            states: list[int]):
    """
    Args:
        dataframes: List of pandas DataFrames to filter.
        states: List of Ints representing the mission states to keep post-filtering.
    """
    


### FILE HANDLING ###
@contextmanager
def open_h5_file(file_path: Path):
    """
    Context manager for safely and efficiently handling h5py file operations.
    
    Args:
        file_path: Path to the HDF5 file
    """
    file = h5py.File(file_path, 'r')
    try:
        yield file
    finally:
        file.close()    

def get_h5_files(path: Path, recursive: bool = False) -> list[Path]:
    """
    Find .h5 files in the specified path. If path is a file, checks if it's an .h5 file.
    If path is a directory, searches for all .h5 files within it.
    
    Args:
        path (Path): Path to the file or directory to search
        recursive (bool): If True, search recursively through subdirectories (only applies to directories)
    
    Returns:
        list[Path]: List of paths to found .h5 files
    """
    # Convert string to Path object if necessary
    path = Path(path)
    h5_files = []
    
    # Check if path is a file
    if path.is_file():
        if path.suffix == '.h5':
            return [path]
        return []
    
    # If path is a directory, search for .h5 files
    if recursive:
        # rglob recursively finds all matches of the pattern
        h5_files = list(path.rglob('*.h5'))
    else:
        # glob only searches in the current directory
        h5_files = list(path.glob('*.h5'))
    
    return h5_files