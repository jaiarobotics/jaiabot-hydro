#!/usr/bin/env python3

import h5py
import argparse
from series_set import SeriesSet
from jaiabot.messages.mission_pb2 import MissionState
import datetime
import numpy
from math import *
from typing import *
import random


class Config:
    sampleFrequency: float
    N: int


class MoscowitzWaveConfig:
    U19_5: float # U_19.5, the wind speed 19.5 m above ocean surface


g = 9.8 # m/s^2


def moscowitzS(f: float, config: MoscowitzWaveConfig):
    # Source: https://wikiwaves.org/Ocean-Wave_Spectra, Pierson and Moscowitz (1964)
    alpha = 8.1e-3 # unitless
    beta = 0.74 # unitless
    omega_0 = g / config.U19_5 # s^-1
    omega = 2 * pi * f
    S = (alpha * g * g) / (omega ** 5) * exp(-beta * (omega_0 / omega) ** 4) # m^2 * s
    Sf = 2 * pi * S # We want the power spectral density versus frequency
    return Sf


def generateMoscowitz(config: Config, waveConfig: MoscowitzWaveConfig):
    # Source: https://wikiwaves.org/Ocean-Wave_Spectra, Pierson and Moscowitz (1964)
    N = config.N
    A: List[float] = [0.0] * N # acceleration spectrum (m / s^2 / Hz)

    for i in range(1, N // 2 + 1):
        f = i * config.sampleFrequency / config.N
        # Get PSD at this frequency
        S = moscowitzS(f, waveConfig)
        # Convert to amplitude of this frequency
        amplitude = sqrt(N // 2 * config.sampleFrequency * S)
        # Give a random phase
        amplitude *= numpy.exp(-(1j) * random.uniform(0, 2 * pi))
        # Convert to acceleration
        acceleration = amplitude * (4 * pi**2 * f**2)

        A[i] += acceleration
        A[N - i] += numpy.conj(acceleration)
    
    acceleration = numpy.fft.ifft(numpy.array(A))
    acceleration = numpy.real(acceleration)

    omega_P = 0.877 * 9.8 / waveConfig.U19_5
    print(f'Peak Frequency = {omega_P / (2 * pi)} Hz')
    swh = 0.21 * (waveConfig.U19_5 ** 2) / g
    print(f'Significant wave height = {swh} m')

    powerSpectrum = powerSpectrumFFT(acceleration, config.sampleFrequency)
    swh = significantWaveHeight(powerSpectrum, config.sampleFrequency)
    print(f'SWH (FFT) = {swh}')

    powerSpectrum = powerSpectrumPeriodogram(acceleration, config.sampleFrequency)
    swh = significantWaveHeight(powerSpectrum, config.sampleFrequency)
    print(f'SWH (periodogram) = {swh}')

    return list(acceleration)


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
    df = sampleFrequency / (2 * (len(powerSpectrum) - 1))
    meanZetaSquared = 0.0 # Mean height
    for i in range(1, len(powerSpectrum)):
        meanZetaSquared += powerSpectrum[i] * df
    return 4 * meanZetaSquared**0.5


def powerSpectrumFFT(acceleration: List[float], sampleFrequency: float):
    A = numpy.fft.fft(acceleration)
    N = len(acceleration)
    S: List[float] = [0.0] * (N // 2 + 1) # Power density spectrum

    for i in range(1, N // 2 + 1):
        f = i * sampleFrequency / N
        amplitude = numpy.absolute(A[i] / (4 * pi**2 * f**2))
        S[i] = amplitude**2 / (N // 2 * sampleFrequency)

    return S


def powerSpectrumPeriodogram(acceleration: List[float], sampleFrequency: float):
    from scipy.signal import periodogram
    N = len(acceleration)

    height = heightFromAcceleration(acceleration, sampleFrequency)

    frequencies, power_spectrum = periodogram(height, fs=sampleFrequency)
    return power_spectrum


def generateSeriesSet(config: Config):
    seriesSet = SeriesSet()

    t_start = datetime.datetime.now().timestamp() * 1000000


    for i in range(0, config.N):
        utime = int(t_start + i * 1e6 / config.sampleFrequency)

        seriesSet.missionState.append(utime, MissionState.IN_MISSION__UNDERWAY__TASK__SURFACE_DRIFT)

        seriesSet.grav_x.append(utime, 0.0)
        seriesSet.grav_y.append(utime, 0.0)
        seriesSet.grav_z.append(utime, -9.8)

        seriesSet.acc_x.append(utime, 0.0)
        seriesSet.acc_y.append(utime, 0.0)
        seriesSet.acc_z.utime.append(utime)

    waveConfig = MoscowitzWaveConfig()
    waveConfig.U19_5 = 6.0
    seriesSet.acc_z.y_values = generateMoscowitz(config, waveConfig)

    return seriesSet


def generateH5(filename: str, config: Config):
    file = h5py.File(filename, mode='w')
    generateSeriesSet(config).writeToH5File(file)
    file.close()


def main():
    parser = argparse.ArgumentParser(description='Generate simulated h5 files for testing.')
    parser.add_argument('-f', '--frequency', type=float, default=4, help='Sampling frequency')
    parser.add_argument('-d', '--duration', type=float, default=120, help='Duration of h5 log to generate (seconds)')
    parser.add_argument('output_filename', type=str, help='Output filename')
    args = parser.parse_args()

    config = Config()
    config.sampleFrequency = args.frequency
    config.N = int(args.duration * config.sampleFrequency)

    generateH5(args.output_filename, config)

if __name__ == '__main__':
    main()
