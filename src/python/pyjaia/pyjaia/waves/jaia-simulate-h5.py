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
from pyjaia.waves.moskowitz import *


class Config:
    sampleFrequency: float
    N: int


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

    seriesSet.acc_z.y_values = generateMoscowitz(config.N, config.sampleFrequency)

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
