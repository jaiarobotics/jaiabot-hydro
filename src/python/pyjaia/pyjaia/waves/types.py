from dataclasses import dataclass
from typing import *
from pyjaia.series import Series


@dataclass
class Wave:
    height: float
    period: float


@dataclass
class Drift:
    rawVerticalAcceleration: Series
    filteredVerticalAcceleration: Series
    powerDensitySpectrum: List[float]
    elevation: Series

    waves: List[Wave]
    significantWaveHeight: float
    peakWavePeriod: float

    def __init__(self):
        self.rawVerticalAcceleration = Series('Raw Vertical Acceleration')
        self.filteredVerticalAcceleration = Series('Filtered Vertical Acceleration')
        self.powerDensitySpectrum = Series('Power Density Spectrum')
        self.elevation = Series('Elevation')
        self.waves = []
        self.significantWaveHeight = 0.0
        self.peakWavePeriod = 0.0
        