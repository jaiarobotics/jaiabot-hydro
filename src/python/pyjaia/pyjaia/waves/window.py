from .types import *
from copy import deepcopy
from math import *


def applyWindow(series: Series, config: WindowConfig):
    """Apply the specified window config to the time series.

    Args:
        series (Series): Input time series.
        config (WindowConfig): Configuration specifying type of windowing function to apply.

    Returns:
        Series: The windowed time series.
    """
    if config.type == 'none':
        return deepcopy(series)
    elif config.type == 'tukey':
        return applyTukeyWindow(series, config.duration)
    else:
        print(f'Unknown window type: {config.type}')
        exit(1)


def applyTukeyWindow(series: Series, duration: float = 2):
    """Apply a Tukey window to the start and end of the series.

    Args:
        series (Series): Input series.
        duration (float, optional): Time period (in microseconds), for the Hann window to move from 0 to 1. Defaults to 2e6.

    Returns:
        Series: The resulting windowed series.
    """

    duration *= 1e6
    newSeries = deepcopy(series)

    if len(series.utime) == 0:
        return newSeries

    t0 = series.utime[0]
    tf = series.utime[-1]

    for index in range(len(series.utime)):
        utime = series.utime[index]

        if utime < t0 + duration:
            s = 0.5 - 0.5 * cos((utime - t0) * pi / duration)
            k = s * s
            newSeries.y_values[index] *= k

        if utime > tf - duration:
            s = 0.5 - 0.5 * cos((tf - utime) * pi / duration)
            k = s * s
            newSeries.y_values[index] *= k

    return newSeries

