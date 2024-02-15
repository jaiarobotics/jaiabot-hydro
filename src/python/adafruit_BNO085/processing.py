from copy import deepcopy
from series import Series
from typing import *
import numpy
import statistics
from math import *
from dataclasses import dataclass


def floatRange(start: float, end: float, delta: float):
    x = start

    while x < end:
        yield x
        x += delta


def resampleSeries(series: Series, freq: float):
    '''Returns a new Series object using this Series\' data, sampled at a constant frequency and suitable for an Fourier-type transform'''
    newSeries = deepcopy(series)
    newSeries.clear()

    if len(series.utime) == 0:
        return newSeries
    
    for utime in floatRange(series.utime[0] + 1, series.utime[-1], 1e6 / freq):
        newSeries.utime.append(utime)
        newSeries.y_values.append(series.getValueAtTime(utime, interpolate=True))
    return newSeries


def fadeSeries(series: Series, fadePeriod: float=2e6):
    '''Slice and fade a series in and out.  Times are in microseconds.'''

    newSeries = deepcopy(series)

    if len(series.utime) == 0:
        return newSeries

    startFadeEndTime = series.utime[0] + fadePeriod
    endFadeStartTime = series.utime[-1] - fadePeriod

    for index in range(len(series.utime)):
        t = series.utime[index]
        # Fade range
        k = 1

        if t < startFadeEndTime:
            k *= ((cos((startFadeEndTime - t) * (pi) / (fadePeriod)) + 1) / 2)
        elif t > endFadeStartTime:
            k *= ((cos((t - endFadeStartTime) * (pi) / (fadePeriod)) + 1) / 2)

        newSeries.y_values[index] *= k

    return newSeries


def trimSeries(series: Series, startGap: float, endGap: float=None):
    """Trim from the beginning and end of a series.

    Args:
        series (Series): Input series.
        startGap (float): Time interval to trim from start.
        endGap (float, optional): Time interval to trim from end. Defaults to None, which means same as startGap.

    Returns:
        Series: The trimmed series.
    """

    endGap = endGap or 0

    newSeries = deepcopy(series)
    newSeries.clear()

    startTimeAbsolute = series.utime[0] + startGap
    endTimeAbsolute = series.utime[-1] - endGap

    for index in range(len(series.utime)):
        t = series.utime[index]

        # Outside slice range
        if t < startTimeAbsolute or t > endTimeAbsolute:
            continue

        newSeries.utime.append(t)
        newSeries.y_values.append(series.y_values[index])

    return newSeries


def applyHanningWindow(series: Series):
    """Applies a Hanning Window to the series.

    Args:
        series (Series): The input series.

    Returns:
        Series: The input series, with a Hanning window applied.
    """
    t0 = series.utime[0]
    totalDuration = series.utime[-1] - series.utime[0]
    newSeries = deepcopy(series)

    for i in range(len(newSeries.utime)):
        utime = newSeries.utime[i]
        newSeries.y_values[i] *= (0.5 * (1 - cos((utime - t0) * 2 * pi / totalDuration)))

    return newSeries


def filterFrequencies(inputSeries: Series, sampleFreq: float, filterFunc: Callable[[float], float]):
    '''Uses a real FFT to filter out frequencies between minFreq and maxFreq, and returns the filtered Series'''
    if len(inputSeries.utime) == 0:
        return Series()

    A = numpy.fft.rfft(inputSeries.y_values)
    n = len(A)
    nyquist = sampleFreq / 2

    if n % 2 == 0:
        freqCoefficient = nyquist / n
    else:
        freqCoefficient = nyquist * (n - 1) / n / n

    for index in range(len(A)):
        freq = freqCoefficient * index
        A[index] *= filterFunc(freq)

    a = numpy.fft.irfft(A)
    series = Series()
    series.utime = inputSeries.utime[:len(a)]
    series.y_values = list(a)

    if (len(series.utime) != len(series.y_values)):
        print(len(series.utime), len(series.y_values))
        exit(1)

    return series


def accelerationToElevation(inputSeries: Series, sampleFreq: float, filterFunc: Callable[[float], float]):
    '''Uses a real FFT to filter out frequencies between minFreq and maxFreq, and returns the filtered Series'''
    if len(inputSeries.utime) == 0:
        return Series()

    A = numpy.fft.rfft(inputSeries.y_values)
    n = len(A)
    nyquist = sampleFreq / 2

    if n % 2 == 0:
        freqCoefficient = nyquist / n
    else:
        freqCoefficient = nyquist * (n - 1) / n / n

    for index in range(len(A)):
        if index == 0: # Get rid of constant acceleration term
            A[index] = 0
            continue

        freq = freqCoefficient * index

        A[index] *= filterFunc(freq)

        A[index] /= (-(2 * pi * freq) ** 2) # Integrate acceleration to elevation series (integrate a sin curve twice)

    a = numpy.fft.irfft(A)
    series = Series()
    series.utime = inputSeries.utime[:len(a)]
    series.y_values = list(a)

    if (len(series.utime) != len(series.y_values)):
        print(f'ERROR: utime and y_values not of same length!')
        print(len(series.utime), len(series.y_values))
        exit(1)

    return series


def deMean(series: Series):
    newSeries = Series()

    if len(series.utime) == 0:
        return newSeries

    y_mean = statistics.mean(series.y_values)
    newSeries.utime = series.utime
    newSeries.y_values = [y - y_mean for y in series.y_values]

    return newSeries


def calculateSortedWaveHeights(elevationSeries: Series):
    waveHeights: List[float] = []
    y = elevationSeries.y_values

    trough = 0
    peak = 0

    direction = 0 # +1 for up, 0 for stationary, -1 for down

    # Find waves
    for index, y in enumerate(elevationSeries.y_values):
        oldDirection = direction

        if y > 0:
            direction = 1
        else:
            direction = -1

        if direction == -1 and oldDirection == 1:
            # Moving down below 0 again, so we finished a wave
            if peak != 0 and trough != 0:
                waveHeights.append(peak - trough)
                peak = 0
                trough = 0
        
        if direction == 1:
            peak = max(y, peak)
        elif direction == -1:
            trough = min(y, trough)

    sortedWaveHeights = sorted(waveHeights)

    return sortedWaveHeights

def calculateSignificantWaveHeightFromSortedWaveHeights(waveHeights: List[float]):
    sortedWaveHeights = sorted(waveHeights)
    N = floor(len(sortedWaveHeights) * 2 / 3)
    significantWaveHeights = sortedWaveHeights[N:]

    if len(significantWaveHeights) == 0:
        return 0.0

    return statistics.mean(significantWaveHeights)
