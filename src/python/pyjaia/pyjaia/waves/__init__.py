from .series_set import *
from .types import *
from .processing import *


def doAnalysis(verticalAcceleration: Series, sampleFreq: float):
    drift = Drift()
    drift.rawVerticalAcceleration = verticalAcceleration.makeUniform(sampleFreq)
    drift.filteredVerticalAcceleration = filterAcceleration(drift.rawVerticalAcceleration, sampleFreq)
    drift.elevation = calculateElevationSeries(drift.rawVerticalAcceleration, sampleFreq)
    drift.waves = getSortedWaves(drift.elevation)
    drift.significantWaveHeight = significantWaveHeight(drift.waves)
    
    return drift
