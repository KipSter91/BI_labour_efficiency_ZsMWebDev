export type Language = "nl" | "en";

export const translations = {
  // Common
  common: {
    line: { nl: "Lijn", en: "Line" },
    lines: { nl: "Lijnen", en: "Lines" },
    total: { nl: "Totaal", en: "Total" },
    subtotal: { nl: "Subtotaal", en: "Subtotal" },
    function: { nl: "Functie", en: "Function" },
    fte: { nl: "FTE", en: "FTE" },
    available: { nl: "Beschikbaar", en: "Available" },
    reset: { nl: "Reset", en: "Reset" },
    export: { nl: "Exporteer", en: "Export" },
    expandAll: { nl: "Alles openen", en: "Expand all" },
    collapseAll: { nl: "Alles sluiten", en: "Collapse all" },
    day: { nl: "Dag", en: "Day" },
    shift: { nl: "Shift", en: "Shift" },
    week: { nl: "Week", en: "Week" },
    year: { nl: "Jaar", en: "Year" },
  },

  // Days
  days: {
    Maandag: { nl: "Maandag", en: "Monday" },
    Dinsdag: { nl: "Dinsdag", en: "Tuesday" },
    Woensdag: { nl: "Woensdag", en: "Wednesday" },
    Donderdag: { nl: "Donderdag", en: "Thursday" },
    Vrijdag: { nl: "Vrijdag", en: "Friday" },
  },

  // Shifts
  shifts: {
    Ochtend: { nl: "Ochtend", en: "Morning" },
    Middag: { nl: "Middag", en: "Afternoon" },
    Nacht: { nl: "Nacht", en: "Night" },
  },

  // Months (short)
  months: {
    jan: { nl: "jan", en: "Jan" },
    feb: { nl: "feb", en: "Feb" },
    mrt: { nl: "mrt", en: "Mar" },
    apr: { nl: "apr", en: "Apr" },
    mei: { nl: "mei", en: "May" },
    jun: { nl: "jun", en: "Jun" },
    jul: { nl: "jul", en: "Jul" },
    aug: { nl: "aug", en: "Aug" },
    sep: { nl: "sep", en: "Sep" },
    okt: { nl: "okt", en: "Oct" },
    nov: { nl: "nov", en: "Nov" },
    dec: { nl: "dec", en: "Dec" },
  },

  // Roles
  roles: {
    bakoperator: { nl: "Bakoperator", en: "Baking Operator" },
    bakoperatorShort: { nl: "Bak.", en: "Bak." },
    inpakoperator: { nl: "Inpakoperator", en: "Packing Operator" },
    inpakoperatorShort: { nl: "Op.", en: "Op." },
    inpakassistent: { nl: "Inpakassistent", en: "Packing Assistant" },
    inpakassistentShort: { nl: "Inp.", en: "Asst." },
  },

  // TopNav
  topNav: {
    labourEfficiency: {
      nl: "Labour Efficiency 2026",
      en: "Labour Efficiency 2026",
    },
    bergambacht: { nl: "Bergambacht", en: "Bergambacht" },
    intro: { nl: "Intro", en: "Intro" },
    blauwprint: { nl: "Blauwprint", en: "Blueprint" },
    planning: { nl: "Planning", en: "Planning" },
    calculator: { nl: "Calculator", en: "Calculator" },
    planner: { nl: "Planner", en: "Planner" },
  },

  // Hero Section
  hero: {
    titleLine1: { nl: "Van blauwprint naar", en: "From blueprint to" },
    titleLine2: { nl: "werkvloer beslissingen", en: "shop floor decisions" },
    subtitle: {
      nl: "Blauwprint ≠ realiteit: FTE beweegt mee met planningcondities.",
      en: "Blueprint ≠ reality: FTE moves with planning conditions.",
    },
    ctaButton: { nl: "Open FTE Calculator", en: "Open FTE Calculator" },
    navigatePres: {
      nl: "Navigeer door de presentatie",
      en: "Navigate the presentation",
    },
  },

  // Hero Cards
  heroCards: {
    blauwprint: {
      title: { nl: "Blauwprint", en: "Blueprint" },
      description: {
        nl: "Bezetting 2026 per lijn.",
        en: "Staffing 2026 per line.",
      },
    },
    planningsregels: {
      title: { nl: "Planningsregels", en: "Planning Rules" },
      description: { nl: "Wanneer FTE wijzigt.", en: "When FTE changes." },
    },
    fteCalculator: {
      title: { nl: "FTE Calculator", en: "FTE Calculator" },
      description: { nl: "Scenario berekening.", en: "Scenario calculation." },
    },
    weekplanner: {
      title: { nl: "Weekplanner", en: "Week Planner" },
      description: {
        nl: "Shiftplanning en bezetting.",
        en: "Shift planning and staffing.",
      },
    },
  },

  // Sections
  sections: {
    blauwprint: {
      eyebrow: { nl: "1. Blauwprint 2026", en: "1. Blueprint 2026" },
      title: { nl: "Bezettingsoverzicht", en: "Staffing Overview" },
      description: {
        nl: "De basis: hoeveel mensen per lijn en per functie in de blauwprint.",
        en: "The basis: how many people per line and per function in the blueprint.",
      },
    },
    planning: {
      eyebrow: {
        nl: "2. Planning omstandigheden",
        en: "2. Planning Conditions",
      },
      title: { nl: "Planningsregels", en: "Planning Rules" },
      description: {
        nl: "De planningscondities gelden voor de inpaklijn (inpakoperator + inpakassistent). Overzicht per lijn, met extra of minder FTE.",
        en: "Planning conditions apply to the packing line (packing operator + packing assistant). Overview per line, with more or less FTE.",
      },
    },
    calculator: {
      eyebrow: { nl: "3. FTE Calculator", en: "3. FTE Calculator" },
      title: { nl: "Scenario berekening", en: "Scenario Calculation" },
      description: {
        nl: "Selecteer actieve lijnen en planning condities. Direct inzicht in FTE impact per scenario.",
        en: "Select active lines and planning conditions. Instant insight into FTE impact per scenario.",
      },
    },
    planner: {
      eyebrow: { nl: "4. Weekplanner", en: "4. Week Planner" },
      title: { nl: "Productieplanner", en: "Production Planner" },
      description: {
        nl: "Plan de bezetting per dag en per shift, met ruimte voor afwijkingen en inpaklijn-condities.",
        en: "Plan staffing per day and shift, with room for deviations and packing line conditions.",
      },
    },
  },

  // Blueprint Tables
  blueprint: {
    linesTitle: { nl: "Lijnen", en: "Lines" },
    lineB: { nl: "Lijn B:", en: "Line B:" },
    normaal: { nl: "Normaal", en: "Normal" },
    mini: { nl: "Mini", en: "Mini" },
    subtotalInpak: { nl: "Subtotaal inpak", en: "Packing subtotal" },
    otherFunctions: { nl: "Overige functies", en: "Other Functions" },
    grandTotal: { nl: "Totaal", en: "Grand Total" },
  },

  // Other roles
  otherRoles: {
    shiftleader: {
      nl: "Shiftleader en assistentie",
      en: "Shift Leader & Assistance",
    },
    shiftleaderShort: { nl: "Shiftleader", en: "Shift Leader" },
    deegbereiding: { nl: "Deegbereiding", en: "Dough Preparation" },
    deegbereidingShort: { nl: "Deeg", en: "Dough" },
    stroopbereiding: { nl: "Stroopbereiding", en: "Syrup Preparation" },
    stroopbereidingShort: { nl: "Stroop", en: "Syrup" },
    kruimelaar: { nl: "Kruimelaar", en: "Crumbler" },
    kruimelaarShort: { nl: "Kruimel", en: "Crumb" },
    schoonmaak: { nl: "Schoonmaak", en: "Cleaning" },
    schoonmaakShort: { nl: "Clean", en: "Clean" },
    td: { nl: "TD (Technische dienst)", en: "TD (Technical Service)" },
  },

  // Planning rules
  planningRules: {
    extraCapacity: {
      nl: "Extra capaciteit (+ FTE)",
      en: "Extra capacity (+ FTE)",
    },
    lessCapacity: {
      nl: "Minder capaciteit (− FTE)",
      en: "Less capacity (− FTE)",
    },
    lijnA8stuks: {
      title: {
        nl: "8-stuks wafel werkopdracht",
        en: "8-piece waffle work order",
      },
      subtitle: {
        nl: "Inpaklijn • Extra capaciteit",
        en: "Packing line • Extra capacity",
      },
      description: {
        nl: "Bij 8-stuks wafel werkopdrachten is 1 extra medewerker nodig op de inpaklijn. Standaard inpaklijn = 3 FTE, bij deze orders = 4 FTE.",
        en: "For 8-piece waffle work orders, 1 extra worker is needed on the packing line. Standard packing line = 3 FTE, with these orders = 4 FTE.",
      },
    },
    lijnETray: {
      title: {
        nl: "Werken met tray of Bjorg Bio-product",
        en: "Working with tray or Bjorg Bio-product",
      },
      subtitle: {
        nl: "Inpaklijn • Extra capaciteit",
        en: "Packing line • Extra capacity",
      },
      description: {
        nl: "Bij werken met tray of bij een Bjorg Bio-product werkopdracht is 1 extra medewerker nodig op de inpaklijn. Regulier = 5 FTE, met tray/Bjorg = 6 FTE.",
        en: "When working with tray or with a Bjorg Bio-product work order, 1 extra worker is needed on the packing line. Regular = 5 FTE, with tray/Bjorg = 6 FTE.",
      },
    },
    lijnBMeli: {
      title: { nl: "Meli werkopdracht", en: "Meli work order" },
      subtitle: {
        nl: "Inpaklijn • Extra capaciteit",
        en: "Packing line • Extra capacity",
      },
      description: {
        nl: "Bij een Meli-werkopdracht is 1 extra medewerker nodig op lijn B. Standaard = 5 FTE, bij Meli = 6 FTE.",
        en: "For a Meli work order, 1 extra worker is needed on line B. Standard = 5 FTE, with Meli = 6 FTE.",
      },
    },
    lijnCAldenteBakkerJoop: {
      title: {
        nl: "Aldente of Bakker Joop werkopdracht",
        en: "Aldente or Bakker Joop work order",
      },
      subtitle: {
        nl: "Inpaklijn • Extra capaciteit",
        en: "Packing line • Extra capacity",
      },
      description: {
        nl: "Bij een Aldente- of Bakker Joop-werkopdracht is 1 extra medewerker nodig op lijn C. Standaard = 3 FTE, bij deze orders = 4 FTE.",
        en: "For an Aldente or Bakker Joop work order, 1 extra worker is needed on line C. Standard = 3 FTE, with these orders = 4 FTE.",
      },
    },
    lijnBMini: {
      title: { nl: "Mini productie", en: "Mini production" },
      subtitle: {
        nl: "Inpaklijn • Minder capaciteit",
        en: "Packing line • Less capacity",
      },
      description: {
        nl: "Bij mini producties is de inpaklijn compacter en zijn slechts 3 medewerkers voldoende. Dit is de minimale bezetting.",
        en: "For mini productions, the packing line is more compact and only 3 workers are sufficient. This is the minimum staffing.",
      },
    },
  },

  // Calculator Panel
  calculator: {
    activeLines: { nl: "Actieve lijnen", en: "Active Lines" },
    conditions: { nl: "Condities", en: "Conditions" },
    stuks8: { nl: "8-stuks", en: "8-piece" },
    tray: { nl: "Tray/Bjorg", en: "Tray/Bjorg" },
    meli: { nl: "Meli", en: "Meli" },
    aldenteBakkerJoop: { nl: "Aldente/Bakker Joop", en: "Aldente/Bakker Joop" },
    resultOverview: { nl: "Overzicht resultaat", en: "Result Overview" },
    inpakLine: { nl: "Inpaklijn", en: "Packing Line" },
    bakLine: { nl: "Baklijn", en: "Baking Line" },
    base: { nl: "Basis", en: "Base" },
    extra: { nl: "Extra", en: "Extra" },
    fromConditions: { nl: "vanuit condities", en: "from conditions" },
    norm: { nl: "Norm", en: "Norm" },
  },

  // Production Planner
  planner: {
    title: { nl: "Weekplanner", en: "Week Planner" },
    nextWeek: { nl: "Week", en: "Week" },
    currentWeekOption: { nl: "Huidige week", en: "Current week" },
    nextWeekOption: { nl: "Volgende week", en: "Next week" },
    autoFill: { nl: "Auto vullen (blauwprint)", en: "Auto fill (blueprint)" },
    resetWeek: { nl: "Reset week", en: "Reset week" },
    resetShift: { nl: "Reset shift", en: "Reset shift" },
    exportPdf: { nl: "Export PDF", en: "Export PDF" },
    resetAll: { nl: "Reset alles", en: "Reset all" },
    expandAll: { nl: "Alles openen", en: "Expand all" },
    collapseAll: { nl: "Alles sluiten", en: "Collapse all" },
    shiftTotal: { nl: "Shift totaal", en: "Shift total" },
    dayTotal: { nl: "Dag totaal", en: "Day total" },
    weekTotal: { nl: "Week totaal", en: "Week total" },
    activeConditions: { nl: "Actieve condities", en: "Active conditions" },
    noConditions: {
      nl: "Geen speciale condities",
      en: "No special conditions",
    },
    pdfTitle: { nl: "Weekplanning", en: "Weekly Schedule" },
    pdfConditions: { nl: "Condities", en: "Conditions" },
    pdfGeneratedOn: { nl: "Gegenereerd op", en: "Generated on" },
    pdfTotal: { nl: "Totaal", en: "Total" },
    pdfLine: { nl: "Lijn", en: "Line" },
    line: { nl: "Lijn", en: "Line" },
    off: { nl: "Uit", en: "Off" },
    a8stuks: { nl: "A: 8-stuks (+1 asst)", en: "A: 8-piece (+1 asst)" },
    bMini: { nl: "B: mini (2 asst)", en: "B: mini (2 asst)" },
    bMeli: { nl: "B: Meli (+1 asst)", en: "B: Meli (+1 asst)" },
    cAldenteBakkerJoop: {
      nl: "C: Aldente/Bakker Joop (+1 asst)",
      en: "C: Aldente/Bakker Joop (+1 asst)",
    },
    eTray: {
      nl: "E: tray/Bjorg (+1 asst)",
      en: "E: tray/Bjorg (+1 asst)",
    },
    a8stuksShort: { nl: "A • 8-stuks", en: "A • 8-piece" },
    bMiniShort: { nl: "B • mini", en: "B • mini" },
    bMeliShort: { nl: "B • Meli", en: "B • Meli" },
    cAldenteBakkerJoopShort: {
      nl: "C • Aldente/BJ",
      en: "C • Aldente/BJ",
    },
    eTrayShort: { nl: "E • tray/Bjorg", en: "E • tray/Bjorg" },
    shiftTotalRow: { nl: "Shift totaal", en: "Shift total" },
    autoFillShift: { nl: "Auto vullen", en: "Auto fill" },
    remarks: { nl: "Opmerkingen", en: "Remarks" },
    remarkFewerLines: {
      nl: "Let op: 2 deegbereider en 1 stroopbereider op planning",
      en: "Note: 2 dough preparers and 1 syrup preparer on schedule",
    },
  },

  // Footer
  footer: {
    allRightsReserved: {
      nl: "Alle rechten voorbehouden",
      en: "All rights reserved",
    },
    developedBy: { nl: "Ontwikkeld door", en: "Developed by" },
  },
} as const;

export type TranslationKey = keyof typeof translations;
