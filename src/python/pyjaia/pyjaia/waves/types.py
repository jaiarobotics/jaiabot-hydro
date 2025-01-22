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
    maxWaveHeight: float
    peakWavePeriod: float

    def __init__(self):
        self.rawVerticalAcceleration = Series('Raw Vertical Acceleration')
        self.filteredVerticalAcceleration = Series('Filtered Vertical Acceleration')
        self.powerDensitySpectrum = None
        self.elevation = Series('Elevation')
        self.waves = None
        self.significantWaveHeight = 0.0
        self.maxWaveHeight = None
        self.peakWavePeriod = 0.0


@dataclass
class BandPassFilterConfig:
    type: str
    minZeroPeriod: float
    minPeriod: float
    maxPeriod: float
    maxZeroPeriod: float


    @staticmethod
    def fromDict(input: Dict):
        return BandPassFilterConfig(**input)


@dataclass
class AnalysisConfig:
    type: str

    @staticmethod
    def fromDict(input: Dict):
        return AnalysisConfig(**input)


@dataclass
class DriftAnalysisConfig:
    glitchy: bool = False
    sampleFreq: float = 4.0
    bandPassFilter: BandPassFilterConfig = None
    analysis: AnalysisConfig = None

    @staticmethod
    def fromDict(input: Dict):
        config = DriftAnalysisConfig(**input)
        config.bandPassFilter = BandPassFilterConfig.fromDict(config.bandPassFilter)
        config.analysis = AnalysisConfig.fromDict(config.analysis)
        return config


    @staticmethod
    def load(configFilename: str):
        import json

        if not configFilename.endswith('.json'):
            configFilename += '.json'

        configDict = json.load(open(configFilename))
        return DriftAnalysisConfig.fromDict(configDict)
