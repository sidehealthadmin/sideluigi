/**
 * Medicare Fee Schedule Lookup Utility
 *
 * Uses the CMS Medicare Physician Fee Schedule API (pfs.data.cms.gov/api)
 * and known OPPS national rates to establish fair market value benchmarks.
 *
 * For hospital outpatient services (like ER visits), OPPS rates are used.
 * For physician/professional services, the MPFS API is queried by locality.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MedicareRate {
  cptCode: string
  description: string
  medicareRate: number | null
  rateSource: string
  rateYear: number
  locality?: string
  facilityOrNonFacility?: 'facility' | 'non_facility'
  notes?: string
  requiresManualReview: boolean
}

export interface CostComparison {
  cptCode: string
  description: string
  billedAmount: number
  medicareRate: number | null
  rateSource: string
  rateYear: number
  ratio: number | null // billedAmount / medicareRate
  assessment: 'within_range' | 'above_range' | 'significantly_above' | 'unknown'
  assessmentNote: string
  requiresManualReview: boolean
}

export interface CostJustificationData {
  patientZip: string
  locality: string
  comparisons: CostComparison[]
  overallAssessment: string
}

// ─── Known OPPS National Payment Rates (CY 2026) ───────────────────────────
// Source: CMS OPPS Addendum B — these are national unadjusted rates.
// Actual rates vary by wage index. These serve as conservative benchmarks.

const OPPS_RATES_2026: Record<string, { rate: number; description: string }> = {
  '99281': { rate: 73.58, description: 'ED Visit Level 1 — Minor problem' },
  '99282': { rate: 195.26, description: 'ED Visit Level 2 — Low complexity' },
  '99283': { rate: 333.44, description: 'ED Visit Level 3 — Moderate complexity' },
  '99284': { rate: 512.83, description: 'ED Visit Level 4 — High complexity' },
  '99285': { rate: 788.14, description: 'ED Visit Level 5 — High complexity / critical' },
}

// ─── Known MPFS National Rates (CY 2026) ────────────────────────────────────
// Source: CMS PFS National Payment Amount File — facility & non-facility
// Used as fallback when API is unreachable

const MPFS_RATES_2026: Record<string, { facility: number; nonFacility: number; description: string }> = {
  '71100': { facility: 28.41, nonFacility: 39.96, description: 'X-ray ribs, unilateral, 2 views' },
  '71101': { facility: 32.18, nonFacility: 45.63, description: 'X-ray ribs, unilateral, min 3 views' },
  '71110': { facility: 33.45, nonFacility: 47.22, description: 'X-ray ribs, bilateral, 3 views' },
  '71111': { facility: 38.90, nonFacility: 55.11, description: 'X-ray ribs, bilateral, min 4 views' },
  '72170': { facility: 27.14, nonFacility: 38.20, description: 'X-ray pelvis, 1-2 views' },
  '73030': { facility: 26.88, nonFacility: 37.65, description: 'X-ray shoulder, min 2 views' },
}

// ─── Locality Mapping (ZIP prefix → Medicare locality) ──────────────────────
// Simplified mapping: first 3 digits of ZIP → locality name and code
// In production, use the full CMS ZIP-to-Carrier-Locality crosswalk file

const ZIP_PREFIX_TO_LOCALITY: Record<string, { locality: string; code: string; state: string }> = {
  // California
  '945': { locality: 'Oakland/Berkeley, CA', code: '07', state: 'CA' },
  '946': { locality: 'Oakland/Berkeley, CA', code: '07', state: 'CA' },
  '947': { locality: 'Oakland/Berkeley, CA', code: '07', state: 'CA' },
  '940': { locality: 'San Jose, CA', code: '09', state: 'CA' },
  '941': { locality: 'San Francisco, CA', code: '05', state: 'CA' },
  '900': { locality: 'Los Angeles, CA', code: '18', state: 'CA' },
  '901': { locality: 'Los Angeles, CA', code: '18', state: 'CA' },
  '902': { locality: 'Los Angeles, CA', code: '18', state: 'CA' },
  '906': { locality: 'Los Angeles, CA', code: '18', state: 'CA' },
  '910': { locality: 'Los Angeles, CA', code: '18', state: 'CA' },
  '920': { locality: 'San Diego, CA', code: '12', state: 'CA' },
  '921': { locality: 'San Diego, CA', code: '12', state: 'CA' },
  '950': { locality: 'Santa Cruz/Monterey, CA', code: '09', state: 'CA' },
  '951': { locality: 'Inland Empire, CA', code: '17', state: 'CA' },
  '958': { locality: 'Sacramento, CA', code: '10', state: 'CA' },
  '959': { locality: 'Sacramento, CA', code: '10', state: 'CA' },
  // New York
  '100': { locality: 'Manhattan, NY', code: '01', state: 'NY' },
  '101': { locality: 'Manhattan, NY', code: '01', state: 'NY' },
  '110': { locality: 'Queens, NY', code: '02', state: 'NY' },
  '112': { locality: 'Brooklyn, NY', code: '02', state: 'NY' },
  // Texas
  '750': { locality: 'Dallas, TX', code: '11', state: 'TX' },
  '770': { locality: 'Houston, TX', code: '10', state: 'TX' },
  // Florida
  '331': { locality: 'Fort Lauderdale, FL', code: '04', state: 'FL' },
  '332': { locality: 'Miami, FL', code: '04', state: 'FL' },
  // Illinois
  '606': { locality: 'Chicago, IL', code: '16', state: 'IL' },
  // Default fallback
  '000': { locality: 'National Average', code: '99', state: '' },
}

// ─── Public Functions ───────────────────────────────────────────────────────

/**
 * Look up the Medicare locality for a given ZIP code.
 */
export function getLocality(zipCode: string): { locality: string; code: string; state: string } {
  const prefix = zipCode.substring(0, 3)
  return ZIP_PREFIX_TO_LOCALITY[prefix] || {
    locality: `National Average (ZIP ${prefix}xxx not in locality table)`,
    code: '99',
    state: '',
  }
}

/**
 * Attempt to fetch the Medicare Physician Fee Schedule rate from the CMS API.
 * Falls back to static data if the API is unreachable.
 */
export async function lookupMPFSRate(
  cptCode: string,
  zipCode: string,
  year: number = 2026
): Promise<MedicareRate> {
  const locality = getLocality(zipCode)
  const staticRate = MPFS_RATES_2026[cptCode]

  // Try CMS PFS API first
  try {
    const url = `https://pfs.data.cms.gov/api/items?year=${year}&hcpcs=${cptCode}&locality=${locality.code}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    })
    clearTimeout(timeout)

    if (response.ok) {
      const data = await response.json()
      if (data && data.length > 0) {
        const record = data[0]
        const facilityRate = parseFloat(record.facilityFee || record.facility_fee || '0')
        const nonFacilityRate = parseFloat(record.nonFacilityFee || record.non_facility_fee || '0')

        return {
          cptCode,
          description: record.description || staticRate?.description || cptCode,
          medicareRate: facilityRate || nonFacilityRate || null,
          rateSource: `CMS MPFS API — ${locality.locality} (Locality ${locality.code})`,
          rateYear: year,
          locality: locality.locality,
          facilityOrNonFacility: 'facility',
          requiresManualReview: false,
        }
      }
    }
  } catch {
    // API unavailable — fall through to static data
  }

  // Fall back to static rates
  if (staticRate) {
    return {
      cptCode,
      description: staticRate.description,
      medicareRate: staticRate.facility,
      rateSource: `CMS MPFS National Payment Amount File CY${year} — facility rate, ${locality.locality}`,
      rateYear: year,
      locality: locality.locality,
      facilityOrNonFacility: 'facility',
      requiresManualReview: false,
    }
  }

  // No data available
  return {
    cptCode,
    description: cptCode,
    medicareRate: null,
    rateSource: 'Not available — flagged for manual staff review',
    rateYear: year,
    locality: locality.locality,
    requiresManualReview: true,
    notes: `No Medicare rate found for CPT ${cptCode} in locality ${locality.locality}. Staff should verify using CMS PFS lookup at https://www.cms.gov/medicare/physician-fee-schedule/search`,
  }
}

/**
 * Look up the OPPS (Hospital Outpatient) rate for an ED or facility service.
 */
export function lookupOPPSRate(cptCode: string, zipCode: string): MedicareRate {
  const locality = getLocality(zipCode)
  const oppsRate = OPPS_RATES_2026[cptCode]

  if (oppsRate) {
    return {
      cptCode,
      description: oppsRate.description,
      medicareRate: oppsRate.rate,
      rateSource: `CMS OPPS Addendum B CY2026 — national unadjusted rate (${locality.locality} wage-index adjustment may apply)`,
      rateYear: 2026,
      locality: locality.locality,
      facilityOrNonFacility: 'facility',
      requiresManualReview: false,
      notes: 'OPPS national rate before geographic wage index adjustment. Actual Medicare payment in this locality may be slightly higher or lower.',
    }
  }

  return {
    cptCode,
    description: cptCode,
    medicareRate: null,
    rateSource: 'Not in OPPS rate table — flagged for manual staff review',
    rateYear: 2026,
    locality: locality.locality,
    requiresManualReview: true,
    notes: `CPT ${cptCode} not found in OPPS Addendum B. Staff should verify APC assignment and rate at https://www.cms.gov/medicare/payment/prospective-payment-systems/hospital-outpatient`,
  }
}

/**
 * Compare a billed amount against the Medicare benchmark rate.
 */
export function compareCost(
  cptCode: string,
  description: string,
  billedAmount: number,
  rate: MedicareRate
): CostComparison {
  if (!rate.medicareRate || rate.medicareRate === 0) {
    return {
      cptCode,
      description,
      billedAmount,
      medicareRate: null,
      rateSource: rate.rateSource,
      rateYear: rate.rateYear,
      ratio: null,
      assessment: 'unknown',
      assessmentNote: `Medicare benchmark not available for CPT ${cptCode}. Flagged for manual review.`,
      requiresManualReview: true,
    }
  }

  const ratio = billedAmount / rate.medicareRate
  let assessment: CostComparison['assessment']
  let assessmentNote: string

  if (ratio <= 2.0) {
    assessment = 'within_range'
    assessmentNote = `Billed amount ($${billedAmount.toLocaleString()}) is ${ratio.toFixed(1)}x the Medicare rate ($${rate.medicareRate.toFixed(2)}), within the typical commercial-to-Medicare ratio range.`
  } else if (ratio <= 5.0) {
    assessment = 'above_range'
    assessmentNote = `Billed amount ($${billedAmount.toLocaleString()}) is ${ratio.toFixed(1)}x the Medicare rate ($${rate.medicareRate.toFixed(2)}), above the typical commercial-to-Medicare ratio of 1.5–3.0x.`
  } else {
    assessment = 'significantly_above'
    assessmentNote = `Billed amount ($${billedAmount.toLocaleString()}) is ${ratio.toFixed(1)}x the Medicare rate ($${rate.medicareRate.toFixed(2)}), significantly exceeding any reasonable commercial-to-Medicare benchmark.`
  }

  return {
    cptCode,
    description,
    billedAmount,
    medicareRate: rate.medicareRate,
    rateSource: rate.rateSource,
    rateYear: rate.rateYear,
    ratio,
    assessment,
    assessmentNote,
    requiresManualReview: rate.requiresManualReview,
  }
}

/**
 * Run a full cost justification analysis for a set of billed line items.
 */
export async function buildCostJustification(
  zipCode: string,
  lineItems: Array<{
    cptCode: string
    description: string
    billedAmount: number
    isHospitalOutpatient: boolean // true for ER facility fees, false for professional/radiology
  }>
): Promise<CostJustificationData> {
  const locality = getLocality(zipCode)
  const comparisons: CostComparison[] = []

  for (const item of lineItems) {
    let rate: MedicareRate

    if (item.isHospitalOutpatient) {
      // Use OPPS rate for hospital facility charges
      rate = lookupOPPSRate(item.cptCode, zipCode)
    } else {
      // Use MPFS rate for professional/radiology services
      rate = await lookupMPFSRate(item.cptCode, zipCode)
    }

    comparisons.push(compareCost(item.cptCode, item.description, item.billedAmount, rate))
  }

  // Build overall assessment
  const significantlyAbove = comparisons.filter(c => c.assessment === 'significantly_above')
  const aboveRange = comparisons.filter(c => c.assessment === 'above_range')
  const needsReview = comparisons.filter(c => c.requiresManualReview)

  let overallAssessment: string
  if (significantlyAbove.length > 0) {
    overallAssessment = `${significantlyAbove.length} of ${comparisons.length} line items are billed at rates significantly exceeding Medicare benchmarks. This supports the argument that the billed charges are not reflective of customary and reasonable rates.`
  } else if (aboveRange.length > 0) {
    overallAssessment = `${aboveRange.length} of ${comparisons.length} line items exceed typical commercial-to-Medicare ratios. A reduction to reasonable commercial rates is warranted.`
  } else {
    overallAssessment = `All billed amounts fall within or below typical commercial-to-Medicare rate ratios for the ${locality.locality} area.`
  }

  if (needsReview.length > 0) {
    overallAssessment += ` Note: ${needsReview.length} item(s) require manual rate verification.`
  }

  return {
    patientZip: zipCode,
    locality: locality.locality,
    comparisons,
    overallAssessment,
  }
}
