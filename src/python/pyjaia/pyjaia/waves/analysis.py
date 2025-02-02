from typing import *
import numpy
from math import *
from pyjaia.series import Series
from .processing import *
from .series_set import *
from .types import *
import functools


def heightFromAcceleration(acceleration: List[float], sampleFrequency: float):
    N = len(acceleration)
    A = numpy.fft.fft(acceleration)
    X = [0.0] * N

    for i in range(1, N // 2 + 1):
        f = i * sampleFrequency / N
        X[i] = A[i] / (4 * pi**2 * f**2)
        X[N - i] = A[N - i] / (4 * pi**2 * f**2)

    return numpy.real(numpy.fft.ifft(X))


def significantWaveHeight(powerSpectrum: List[float], sampleFrequency: float):
    df = sampleFrequency / 2 / len(powerSpectrum)
    meanZetaSquared = 0.0 # Mean height
    for i in range(1, len(powerSpectrum)):
        meanZetaSquared += powerSpectrum[i] * df
    return 4 * meanZetaSquared**0.5


def peakWavePeriod(powerSpectrum: List[float], sampleFrequency: float):
    N = len(powerSpectrum)
    maxPowerDensity = 0.0
    maxIndex = 0

    for index, powerDensity in enumerate(powerSpectrum):
        if powerDensity > maxPowerDensity:
            maxPowerDensity = powerDensity
            maxIndex = index

    maxFrequency = maxIndex * sampleFrequency / 2 / N

    return 1.0 / maxFrequency


def powerSpectrumFFT(acceleration: List[float], sampleFrequency: float):
    A = numpy.fft.fft(acceleration)
    N = len(acceleration)
    S: List[float] = [0.0] * (N // 2 + 1) # Power density spectrum

    for i in range(1, N // 2 + 1):
        f = i * sampleFrequency / N
        amplitude = numpy.absolute(A[i] / (4 * pi**2 * f**2))
        S[i] = amplitude**2 / (N // 2 * sampleFrequency)

    return S


def powerSpectrumPeriodogram(elevation: List[float], config: DriftAnalysisConfig):
    from scipy.signal import periodogram
    frequencies, power_spectrum = periodogram(elevation, fs=config.sampleFreq)
    return power_spectrum


def powerSpectrumWelch(elevation: List[float], config: DriftAnalysisConfig):
    from scipy.signal import welch

    frequencies, power_spectrum = welch(
        elevation,  # Input signal
        fs=config.sampleFreq,    # Sampling frequency (Hz)
        nperseg=config.analysis.segmentLength, # Length of each segment
        scaling='density'        # Power spectral density scaling
    )
    return power_spectrum


def powerSpectrumBurg(elevation: List[float], config: DriftAnalysisConfig):
    from spectrum import pburg
    
    ar_psd = pburg(elevation, order=10)
    return ar_psd().psd


def doDriftAnalysis(verticalAcceleration: Series, config: DriftAnalysisConfig):
    drift = Drift()
    drift.rawVerticalAcceleration = verticalAcceleration.makeUniform(config.sampleFreq)
    drift.filteredVerticalAcceleration = filterAcceleration(drift.rawVerticalAcceleration, config.sampleFreq, config.bandPassFilter)
    drift.elevation = calculateElevationSeries(drift.rawVerticalAcceleration, config.sampleFreq, config.bandPassFilter)

    if config.analysis.type == 'counting':
        drift = doWaveCounting(drift, config)
    elif config.analysis.type == 'fft':
        drift = doFFT(drift, config)
    elif config.analysis.type == 'welch':
        drift = doWelch(drift, config)
    elif config.analysis.type == 'periodogram':
        drift = doPeriodogram(drift, config)
    elif config.analysis.type == 'burg':
        drift = doBurg(drift, config)
    else:
        print(f'Unknown analysis type: {config.analysis.type}')
        exit(1)

    return drift


def doDriftAnalysisFromFile(h5File: h5py.File, timeRange: List[int], config: DriftAnalysisConfig):
    seriesSet = SeriesSet.loadFromH5File(h5File)
    seriesSetsFilteredByTime = seriesSet.split(lambda i, seriesSet: seriesSet.accelerationVertical.utime[i] in range(timeRange[0], timeRange[1]))

    if len(seriesSetsFilteredByTime) != 1:
        return None

    driftSeriesSet = seriesSetsFilteredByTime[0]

    drift = Drift()
    drift.rawVerticalAcceleration = driftSeriesSet.accelerationVertical.makeUniform(config.sampleFreq)
    drift.filteredVerticalAcceleration = filterAcceleration(drift.rawVerticalAcceleration, config.sampleFreq, config.bandPassFilter)
    drift.elevation = calculateElevationSeries(drift.rawVerticalAcceleration, config.sampleFreq, config.bandPassFilter)

    if config.analysis.type == 'counting':
        drift = doWaveCounting(drift, config)
    elif config.analysis.type == 'fft':
        drift = doFFT(drift, config)
    elif config.analysis.type == 'welch':
        drift = doWelch(drift, config)
    elif config.analysis.type == 'periodogram':
        drift = doPeriodogram(drift, config)
    elif config.analysis.type == 'burg':
        drift = doBurg(drift, config)
    else:
        print(f'Unknown analysis type: {config.analysis.type}')
        exit(1)

    return drift


def doWaveCounting(drift: Drift, config: DriftAnalysisConfig):
    drift.waves = getSortedWaves(drift.elevation)
    drift.significantWaveHeight = significantWaveHeightFromWaveList(drift.waves)
    
    peakWave = max(drift.waves, key=lambda wave: wave.height)
    drift.maxWaveHeight = peakWave.height
    drift.peakWavePeriod = peakWave.period
    
    return drift


def doFFT(drift: Drift, config: DriftAnalysisConfig):
    drift.powerDensitySpectrum = powerSpectrumFFT(drift.filteredVerticalAcceleration.y_values, config.sampleFreq)
    drift.significantWaveHeight = significantWaveHeight(drift.powerDensitySpectrum, config.sampleFreq)
    drift.peakWavePeriod = peakWavePeriod(drift.powerDensitySpectrum, config.sampleFreq)
    
    return drift


def doWelch(drift: Drift, config: DriftAnalysisConfig):
    drift.powerDensitySpectrum = powerSpectrumWelch(drift.elevation.y_values, config)
    drift.significantWaveHeight = significantWaveHeight(drift.powerDensitySpectrum, config.sampleFreq)
    drift.peakWavePeriod = peakWavePeriod(drift.powerDensitySpectrum, config.sampleFreq)
    
    return drift


def doPeriodogram(drift: Drift, config: DriftAnalysisConfig):
    drift.powerDensitySpectrum = powerSpectrumPeriodogram(drift.elevation.y_values, config)
    drift.significantWaveHeight = significantWaveHeight(drift.powerDensitySpectrum, config.sampleFreq)
    drift.peakWavePeriod = peakWavePeriod(drift.powerDensitySpectrum, config.sampleFreq)
    
    return drift


def doBurg(drift: Drift, config: DriftAnalysisConfig):
    drift.powerDensitySpectrum = powerSpectrumBurg(drift.elevation.y_values, config)
    drift.significantWaveHeight = significantWaveHeight(drift.powerDensitySpectrum, config.sampleFreq)
    drift.peakWavePeriod = peakWavePeriod(drift.powerDensitySpectrum, config.sampleFreq)
    
    return drift


def getPowerDensitySpectrumFrequencies(N: int, sampleFrequency: float):
    return [i * sampleFrequency / 2 / N for i in range(N)]
