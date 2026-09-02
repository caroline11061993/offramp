import { calcTax, marginalTaxOnExtra, incomeTaxOnly, grossUpTaxableWithdrawal } from "./tax";
import {
  MAX_SAFE_WITHDRAWAL_RATE,
  LISA_ANNUAL_CONTRIBUTION_CAP,
  LISA_BONUS_RATE,
  LISA_CONTRIBUTION_END_AGE,
  LISA_ACCESS_AGE,
  PENSION_TAX_FREE_FRACTION,
} from "./constants";
import type { AllocMode, EquityCashOutMode } from "./types";

export interface FireAgeInputs {
  currentAge: number;
  lifeExpectancy: number;
  /** NOMINAL driver — decimal, e.g. 0.02 = 2%/yr. Reconstructs nominal £ from every
   *  "today's £" field below, since the simulation deliberately runs in nominal terms
   *  internally (UK tax bands are frozen nominally; mortgage payments are fixed nominal
   *  amounts) and only deflates back to real terms at the point of display. */
  inflation: number;

  salary0: number; // gross annual salary, today's £
  cash0: number;
  /** REAL rate above inflation — inflation is added back manually inside simulate():
   *  cash *= (1 + cashReturn + inflation). */
  cashReturn: number;
  /** Dormant — no UI control. Months of spend held as a cash buffer before the ISA/GIA sweep. */
  bufferMonths: number;

  isa0: number;
  gia0: number;
  lisa0: number;
  /** Monthly, today's £ — always applied regardless of allocMode (like pensionContribM),
   *  not swept in automatically. Stops entirely from age 50 onward (real LISA rule: you
   *  can keep contributing, with the 25% bonus, up until the day before you turn 50).
   *  The 25% government bonus applies to the portion of the annual total at or below
   *  LISA_ANNUAL_CAP; anything contributed above that cap still goes in, just without
   *  a bonus on the excess. Locked from withdrawal until LISA_ACCESS_AGE — this engine
   *  doesn't model the first-home exception, since this is a FIRE/retirement tool, not
   *  a house-purchase one. */
  lisaContribM: number;
  /** Dormant — no UI control, always 'auto' in practice. 'manual' would enable
   *  isaContribM/giaContribM below as flat monthly contributions instead of the
   *  automatic buffer -> ISA -> GIA sweep. */
  allocMode: AllocMode;
  isaAllowance: number; // annual ISA subscription allowance, today's £
  isaContribM: number; // manual mode only — monthly, today's £
  giaContribM: number; // manual mode only — monthly, today's £

  pension0: number;
  pensionContribM: number; // combined employee+employer, monthly, today's £
  pensionAccess: number; // age pension can first be drawn
  salSacrifice: boolean;

  spend0: number; // annual living expenses excl. mortgage, today's £
  careAge: number;
  /** REAL, EXTRA escalation on top of inflation, applied from careAge onward. */
  careRate: number;

  hasProperty: boolean;
  propValue0: number;
  mortgageBal0: number;
  mortgageRate: number; // decimal, nominal annual rate
  mortgageTerm: number; // years remaining
  /** REAL rate — inflation added manually: propertyVal *= (1 + propAppreciation + inflation). */
  propAppreciation: number;

  spOn: boolean;
  spAge: number;
  spAmount0: number; // today's £

  dbPensionOn: boolean;
  /** Annual income the scheme would pay at dbPensionNormalAge, today's £ — not a pot,
   *  an income stream, taxed the same simplified way as the State Pension (netted
   *  straight off required spending rather than run through calcTax). */
  dbPensionAnnual0: number;
  /** The scheme's own Normal Pension Age — full, un-reduced income from here. */
  dbPensionNormalAge: number;
  /** Fraction knocked off dbPensionAnnual0 for every year it's claimed before
   *  dbPensionNormalAge (a linear approximation of real schemes' actuarial reduction
   *  tables — e.g. 0.05 knocks off 5% per early year). Claiming can't start before
   *  pensionAccess, same floor as the DC pension; claiming at or after
   *  dbPensionNormalAge draws the full amount with no reduction. */
  dbPensionReductionRate: number;

  /**
   * Couple mode: models a second person's salary, DC pension, and DB pension as a
   * parallel track, since UK income tax is assessed per-individual — a household's
   * combined tax bill depends on how income and pension drawdown are split between
   * two people, not just the total. Deliberately NOT duplicated: cash/ISA/LISA/GIA
   * (treated as shared household savings — most couples pool these anyway, and the
   * actual research-evidenced ask was about pension drawdown-stage tax imbalance,
   * not full separate account tracking), spending, and property/mortgage (already
   * household-level concepts). When coupleMode is false, every partner* field below
   * is ignored and behaviour is byte-for-byte identical to solo mode.
   */
  coupleMode: boolean;
  partnerSalary0: number; // gross annual salary, today's £
  partnerPension0: number;
  partnerPensionContribM: number; // combined employee+employer, monthly, today's £
  partnerPensionAccess: number;
  partnerSalSacrifice: boolean;
  partnerDbPensionOn: boolean;
  partnerDbPensionAnnual0: number;
  partnerDbPensionNormalAge: number;
  partnerDbPensionReductionRate: number;

  eqOn: boolean;
  eqShares: number;
  eqPrice: number; // £/share, today's £
  eqFutureOn: boolean;
  eqFutureAnnual0: number; // today's £ value vesting per year
  eqFutureYears: number;
  /** REAL rate ("Expected share growth (real)" in UI) — inflation added manually:
   *  equityHeld *= (1 + eqGrowth + inflation). */
  eqGrowth: number;
  eqMode: EquityCashOutMode;
  eqGradualPct: number; // fraction of held equity sold per year in 'gradual' mode

  /** NOMINAL rate ("before inflation" in UI), used as-is with no inflation adjustment,
   *  and the SAME single rate for both the working and retired phases — do not split
   *  into a working/retired pair, that was deliberately simplified out of an earlier
   *  version of the source. */
  growth: number;
  /** NOMINAL rate, same single-rate convention as `growth`. */
  pensionGrowth: number;
}

export interface FireAgeYearRow {
  age: number;
  /** All money fields on this row are deflated back to today's £ for display — the
   *  simulation itself runs nominal internally (see FireAgeInputs.inflation doc). */
  cash: number;
  isa: number;
  gia: number;
  lisa: number;
  equity: number;
  pension: number;
  propertyEquity: number;
  liquidTotal: number;
  total: number;
  retired: boolean;
  spend: number;
  /** DB pension income actually paid this year (0 before pensionAccess, 0 if dbPensionOn
   *  is off, reduced below dbPensionAnnual0 if claimed before dbPensionNormalAge). */
  dbPensionPaid: number;
  /** 0 whenever coupleMode is off. Tracked separately from `pension` specifically so a
   *  results view can compare the two partners' pots and flag drawdown-tax imbalance —
   *  the actual couples-mode ask from research, not just a bigger combined number. */
  partnerPension: number;
  partnerDbPensionPaid: number;
  /** Household gross salary this year — primary + partner if coupleMode is on, 0 once
   *  retired (salary stops; DB/State Pension income is tracked separately above). */
  grossIncome: number;
  incomeTax: number;
  nationalInsurance: number;
  takeHomePay: number;
  mortgagePaid: number;
  mortgageBal: number;
  growthRate: number; // echo of inputs.growth, for the year-by-year table
  propGrowthRate: number | null; // echo of inputs.propAppreciation
}

export interface SimulationResult {
  rows: FireAgeYearRow[];
  survived: boolean;
  depletionAge: number | null;
  propertyTapped: boolean;
  impliedSWR: number | null; // first retired year's draw ÷ portfolio value before that draw
}

export interface FireAgeSearchResult {
  age: number | null;
  result: SimulationResult | null;
}

/**
 * Runs one full retirement-age scenario, year by year, from currentAge to lifeExpectancy.
 * @param includeIlliquid if true, property equity is drawn as a last-resort decumulation
 *   source once cash / GIA+equity / ISA / pension are exhausted.
 */
export function simulate(
  inp: FireAgeInputs,
  retireAge: number,
  includeIlliquid: boolean,
): SimulationResult {
  const horizon = Math.max(1, inp.lifeExpectancy - inp.currentAge);
  let cash = inp.cash0;
  let isa = inp.isa0;
  let gia = inp.gia0;
  let lisa = inp.lisa0;
  let pension = inp.pension0;
  let partnerPension = inp.coupleMode ? inp.partnerPension0 : 0;
  let equityHeld = inp.eqOn ? inp.eqShares * inp.eqPrice : 0;
  let mortgageBal = inp.hasProperty ? inp.mortgageBal0 : 0;
  let propertyVal = inp.hasProperty ? inp.propValue0 : 0;

  let mortgagePayment = 0;
  if (inp.hasProperty && mortgageBal > 0 && inp.mortgageTerm > 0) {
    const monthlyRate = inp.mortgageRate / 12;
    const nMonths = inp.mortgageTerm * 12;
    const monthlyPayment =
      monthlyRate === 0
        ? mortgageBal / nMonths
        : (mortgageBal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -nMonths));
    mortgagePayment = monthlyPayment * 12;
  }

  const rows: FireAgeYearRow[] = [];
  let survived = true;
  let depletionAge: number | null = null;
  let propertyTapped = false;
  let firstYearDraw: number | null = null;
  let firstYearPortfolio: number | null = null;

  for (let y = 0; y <= horizon; y++) {
    const age = inp.currentAge + y;
    const retired = age >= retireAge;
    const growth = inp.growth;
    const pensionGrowth = inp.pensionGrowth;
    const inflFactor = Math.pow(1 + inp.inflation, y);

    if (y > 0) {
      cash *= 1 + inp.cashReturn + inp.inflation;
      isa *= 1 + growth;
      gia *= 1 + growth;
      lisa *= 1 + growth;
      pension *= 1 + pensionGrowth;
      partnerPension *= 1 + pensionGrowth;
      equityHeld *= 1 + inp.eqGrowth + inp.inflation;
      if (inp.hasProperty) {
        propertyVal *= 1 + inp.propAppreciation + inp.inflation;
        if (mortgageBal > 0) {
          const monthlyRate = inp.mortgageRate / 12;
          const monthlyPayment = mortgagePayment / 12;
          for (let m = 0; m < 12 && mortgageBal > 0; m++) {
            const interest = mortgageBal * monthlyRate;
            let principal = monthlyPayment - interest;
            if (principal > mortgageBal) principal = mortgageBal;
            mortgageBal = Math.max(0, mortgageBal - principal);
          }
        }
      }
    }

    const mortgagePaidThisYear = inp.hasProperty && mortgageBal > 0 ? mortgagePayment : 0;
    let spendNominal = inp.spend0 * inflFactor;
    if (age >= inp.careAge) {
      const yearsIntoCare = age - inp.careAge;
      spendNominal *= Math.pow(1 + inp.careRate, yearsIntoCare + 1);
    }

    let isaContribThisYear = 0;
    let giaContribThisYear = 0;
    let lisaContribThisYear = 0;
    let pensionContribThisYear = 0;

    // Equity: transition-to-retirement liquidation happens exactly once.
    if (
      inp.eqOn &&
      retired &&
      age === retireAge &&
      inp.eqMode === "atRetirement" &&
      equityHeld > 0
    ) {
      const net = calcTax(equityHeld).takeHome;
      gia += net;
      equityHeld = 0;
    }

    let partnerPensionContribThisYear = 0;
    let grossIncomeThisYear = 0;
    let incomeTaxThisYear = 0;
    let niThisYear = 0;
    let takeHomeThisYear = 0;
    if (!retired) {
      pensionContribThisYear = inp.pensionContribM * 12 * inflFactor;
      pension += pensionContribThisYear;

      const salaryNominal = inp.salary0 * inflFactor;
      const taxableSalary = inp.salSacrifice
        ? Math.max(0, salaryNominal - pensionContribThisYear)
        : salaryNominal;
      const taxResult = calcTax(taxableSalary);
      let takeHome = taxResult.takeHome;
      grossIncomeThisYear = salaryNominal;
      incomeTaxThisYear = taxResult.tax;
      niThisYear = taxResult.ni;

      // Partner track: same tax/salary-sacrifice mechanics as the primary person, run
      // independently since UK income tax is assessed per-individual, not jointly.
      // Both partners are assumed to stop working at the same retireAge — modelling
      // two independent retirement ages is out of scope here.
      if (inp.coupleMode) {
        partnerPensionContribThisYear = inp.partnerPensionContribM * 12 * inflFactor;
        partnerPension += partnerPensionContribThisYear;

        const partnerSalaryNominal = inp.partnerSalary0 * inflFactor;
        const partnerTaxableSalary = inp.partnerSalSacrifice
          ? Math.max(0, partnerSalaryNominal - partnerPensionContribThisYear)
          : partnerSalaryNominal;
        const partnerTaxResult = calcTax(partnerTaxableSalary);
        takeHome += partnerTaxResult.takeHome;
        grossIncomeThisYear += partnerSalaryNominal;
        incomeTaxThisYear += partnerTaxResult.tax;
        niThisYear += partnerTaxResult.ni;
      }
      takeHomeThisYear = takeHome;

      // Equity: gradual sale of currently-held equity, plus new future vesting.
      if (inp.eqOn) {
        if (inp.eqMode === "gradual" && inp.eqGradualPct > 0 && equityHeld > 0) {
          const sellAmount = equityHeld * inp.eqGradualPct;
          const extraTax = marginalTaxOnExtra(taxableSalary, sellAmount);
          const net = sellAmount - extraTax;
          equityHeld -= sellAmount;
          gia += net;
        }
        if (inp.eqFutureOn && y < inp.eqFutureYears) {
          equityHeld += inp.eqFutureAnnual0 * inflFactor;
        }
      }

      if (inp.allocMode === "manual") {
        isaContribThisYear = inp.isaContribM * 12 * inflFactor;
        giaContribThisYear = inp.giaContribM * 12 * inflFactor;
      }

      // LISA contributions are always explicit (like pension), not swept in from
      // surplus, and stop entirely once you're too old to keep earning the bonus.
      if (age < LISA_CONTRIBUTION_END_AGE) {
        lisaContribThisYear = inp.lisaContribM * 12 * inflFactor;
      }
      const lisaBonusThisYear =
        Math.min(lisaContribThisYear, LISA_ANNUAL_CONTRIBUTION_CAP) * LISA_BONUS_RATE;

      const outflow =
        spendNominal +
        mortgagePaidThisYear +
        isaContribThisYear +
        giaContribThisYear +
        lisaContribThisYear +
        (inp.salSacrifice ? 0 : pensionContribThisYear) +
        (inp.coupleMode && !inp.partnerSalSacrifice ? partnerPensionContribThisYear : 0);
      const surplus = takeHome - outflow;
      isa += isaContribThisYear;
      gia += giaContribThisYear;
      lisa += lisaContribThisYear + lisaBonusThisYear;
      if (surplus > 0) cash += surplus;
    }

    // Cash buffer sweep: buffer -> ISA (to allowance) -> GIA, every year.
    const buffer = (inp.bufferMonths / 12) * spendNominal;
    if (cash > buffer) {
      let excess = cash - buffer;
      const isaHeadroom = Math.max(0, inp.isaAllowance - isaContribThisYear);
      const toIsa = Math.min(excess, isaHeadroom);
      isa += toIsa;
      cash -= toIsa;
      excess -= toIsa;
      if (excess > 0) {
        gia += excess;
        cash -= excess;
      }
    }

    let dbPensionAnnual = 0;
    if (inp.dbPensionOn && retired && age >= inp.pensionAccess) {
      const yearsEarly = Math.max(0, inp.dbPensionNormalAge - age);
      const reductionFactor = Math.max(0, 1 - inp.dbPensionReductionRate * yearsEarly);
      dbPensionAnnual = inp.dbPensionAnnual0 * inflFactor * reductionFactor;
    }
    let partnerDbPensionAnnual = 0;
    if (inp.coupleMode && inp.partnerDbPensionOn && retired && age >= inp.partnerPensionAccess) {
      const partnerYearsEarly = Math.max(0, inp.partnerDbPensionNormalAge - age);
      const partnerReductionFactor = Math.max(0, 1 - inp.partnerDbPensionReductionRate * partnerYearsEarly);
      partnerDbPensionAnnual = inp.partnerDbPensionAnnual0 * inflFactor * partnerReductionFactor;
    }

    if (retired) {
      const portfolioBeforeDraw = cash + isa + gia + lisa + equityHeld + pension + partnerPension;
      const spAnnual = inp.spOn && age >= inp.spAge ? inp.spAmount0 * inflFactor : 0;

      // DB pension and State Pension are fully taxable income in the UK (neither is
      // NI-liable) — tax them before netting them off required spend, rather than treating
      // the gross amount as pound-for-pound spendable. State Pension is attributed to the
      // primary person's tax position, matching its single (non-partner-specific) input
      // field; the partner's DB pension is taxed against the partner's own position, since
      // UK income tax is assessed per individual, not jointly.
      const primaryOtherTaxableIncome = dbPensionAnnual + spAnnual;
      const netPrimaryOther = primaryOtherTaxableIncome - incomeTaxOnly(primaryOtherTaxableIncome).tax;
      const netPartnerDb = partnerDbPensionAnnual - incomeTaxOnly(partnerDbPensionAnnual).tax;

      let required = Math.max(0, spendNominal + mortgagePaidThisYear - netPrimaryOther - netPartnerDb);
      if (firstYearDraw === null) {
        firstYearDraw = required;
        firstYearPortfolio = portfolioBeforeDraw;
      }

      const drawCash = Math.min(cash, required);
      cash -= drawCash;
      required -= drawCash;

      // GIA/equity withdrawals are drawn pound-for-pound here — a known simplification.
      // Realistically GIA gains above the CGT annual exempt amount are taxable, but this
      // engine doesn't track per-pound cost basis for GIA (contributions, growth, and
      // withdrawals all net into one balance), so there's no principled way to know what
      // fraction of a withdrawal is gain vs. return of capital. Modelling CGT here needs
      // cost-basis tracking added first — that's a separate piece of work, not folded into
      // this pass so it isn't bolted on as a guess.
      const investPool = gia + equityHeld;
      let drawInvest = 0;
      if (required > 0 && investPool > 0) {
        drawInvest = Math.min(investPool, required);
        const fromGia = Math.min(gia, drawInvest);
        gia -= fromGia;
        equityHeld -= drawInvest - fromGia;
        required -= drawInvest;
      }

      let drawIsa = 0;
      if (required > 0 && isa > 0) {
        drawIsa = Math.min(isa, required);
        isa -= drawIsa;
        required -= drawIsa;
      }

      let drawLisa = 0;
      if (required > 0 && age >= LISA_ACCESS_AGE && lisa > 0) {
        drawLisa = Math.min(lisa, required);
        lisa -= drawLisa;
        required -= drawLisa;
      }

      // Pension drawdown is taxed as income beyond its 25% tax-free element, stacked on top
      // of DB pension + State Pension in the tax bands (taken UFPLS-style pro-rata on each
      // withdrawal — see PENSION_TAX_FREE_FRACTION). Gross up so the pot yields enough net
      // proceeds to cover what's left of required, rather than draining it pound-for-pound.
      let drawPension = 0;
      if (required > 0 && age >= inp.pensionAccess && pension > 0) {
        const { drawn, net } = grossUpTaxableWithdrawal(
          pension,
          required,
          primaryOtherTaxableIncome,
          PENSION_TAX_FREE_FRACTION,
        );
        drawPension = drawn;
        pension -= drawn;
        required -= net;
      }

      let drawPartnerPension = 0;
      if (inp.coupleMode && required > 0 && age >= inp.partnerPensionAccess && partnerPension > 0) {
        const { drawn, net } = grossUpTaxableWithdrawal(
          partnerPension,
          required,
          partnerDbPensionAnnual,
          PENSION_TAX_FREE_FRACTION,
        );
        drawPartnerPension = drawn;
        partnerPension -= drawn;
        required -= net;
      }

      // Property, last resort — no CGT modelled on the sale (a real main residence usually
      // qualifies for Private Residence Relief and is CGT-exempt anyway, so this is a much
      // smaller gap than the GIA one above; still unmodelled if this isn't the main home).
      if (required > 0.5 && includeIlliquid && propertyVal > 0) {
        const drawProp = Math.min(propertyVal, required);
        propertyVal -= drawProp;
        required -= drawProp;
        if (drawProp > 0) propertyTapped = true;
      }

      if (required > 0.5) {
        survived = false;
        if (depletionAge === null) depletionAge = age;
      }
    }

    const liquidTotal = cash + isa + gia + lisa + equityHeld + pension + partnerPension;
    const propertyEquity = inp.hasProperty ? Math.max(0, propertyVal - mortgageBal) : 0;
    const total = liquidTotal + propertyEquity;

    // Deflate back to today's money for display — the internal simulation runs on
    // nominal (inflated) pounds on purpose (fiscal drag on frozen tax bands, a fixed
    // nominal mortgage payment), but nothing should be shown to the user in nominal terms.
    const df = inflFactor;
    rows.push({
      age,
      cash: cash / df,
      isa: isa / df,
      gia: gia / df,
      lisa: lisa / df,
      equity: equityHeld / df,
      pension: pension / df,
      propertyEquity: propertyEquity / df,
      liquidTotal: liquidTotal / df,
      total: total / df,
      retired,
      spend: spendNominal / df,
      dbPensionPaid: dbPensionAnnual / df,
      partnerPension: partnerPension / df,
      partnerDbPensionPaid: partnerDbPensionAnnual / df,
      grossIncome: grossIncomeThisYear / df,
      incomeTax: incomeTaxThisYear / df,
      nationalInsurance: niThisYear / df,
      takeHomePay: takeHomeThisYear / df,
      mortgagePaid: mortgagePaidThisYear / df,
      mortgageBal: mortgageBal / df,
      growthRate: growth,
      propGrowthRate: inp.hasProperty ? inp.propAppreciation : null,
    });
  }

  const impliedSWR =
    firstYearPortfolio && firstYearPortfolio > 0
      ? (firstYearDraw as number) / firstYearPortfolio
      : null;

  return { rows, survived, depletionAge, propertyTapped, impliedSWR };
}

/**
 * Searches retire ages [currentAge+1, min(currentAge+55, lifeExpectancy)] for the earliest
 * that both survives to life expectancy AND keeps its first retired year's implied
 * withdrawal rate at or below MAX_SAFE_WITHDRAWAL_RATE — bare survival on one deterministic
 * path isn't enough, since that can happen at withdrawal rates well past any real safety
 * margin. Returns null if no age in range clears both bars, rather than silently returning
 * a technically-surviving-but-risky one.
 */
export function findFireAge(inp: FireAgeInputs, includeIlliquid: boolean): FireAgeSearchResult {
  const maxAge = Math.min(inp.currentAge + 55, inp.lifeExpectancy);
  for (let r = inp.currentAge + 1; r <= maxAge; r++) {
    const result = simulate(inp, r, includeIlliquid);
    if (
      result.survived &&
      result.impliedSWR !== null &&
      result.impliedSWR <= MAX_SAFE_WITHDRAWAL_RATE
    ) {
      return { age: r, result };
    }
  }
  return { age: null, result: null };
}
