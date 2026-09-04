
import { describe, it, expect } from 'vitest'
import { calcCentroid, haversineKm, fairnessScore } from './centroid'

describe('calcCentroid', () => {
  it('midpoint of two points', () => {
    const r = calcCentroid([{ lat:28.6, lng:77.2 }, { lat:28.8, lng:77.4 }])
    expect(r.lat).toBeCloseTo(28.7)
    expect(r.lng).toBeCloseTo(77.3)
  })
  it('handles single point', () => {
    const pt = { lat:28.6139, lng:77.209 }
    expect(calcCentroid([pt])).toEqual(pt)
  })
})

describe('haversineKm', () => {
  it('same point = 0 km', () => {
    const pt = { lat:28.6, lng:77.2 }
    expect(haversineKm(pt, pt)).toBeCloseTo(0)
  })
  it('Delhi to Mumbai ≈ 1150 km', () => {
    expect(haversineKm(
      { lat:28.6139, lng:77.209 },
      { lat:19.076, lng:72.8777 }
    )).toBeCloseTo(1150, -2)
  })
})

describe('fairnessScore', () => {
  it('central venue scores lower than off-centre', () => {
    const p = [{ lat:28.5, lng:77.0 }, { lat:28.9, lng:77.4 }]
    expect(fairnessScore({ lat:28.7, lng:77.2 }, p))
      .toBeLessThan(fairnessScore({ lat:28.5, lng:77.0 }, p))
  })
})