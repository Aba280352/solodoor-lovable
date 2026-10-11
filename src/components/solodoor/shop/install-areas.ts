/** Where Solodoor installs doors, and how long it takes. Nowhere else: an order outside these areas cannot be installed. */
export const INSTALL_AREAS: { name: string; places: string }[] = [
  { name: "הגליל המערבי", places: "נהריה, עכו והסביבה" },
  { name: "אזור חיפה והקריות", places: "חיפה, הקריות, נשר וטירת כרמל" },
  { name: "מישור החוף הצפוני", places: "עתלית, זכרון יעקב, חדרה ואור עקיבא" },
  { name: "השרון", places: "נתניה, כפר סבא, רעננה, הרצליה והסביבה" },
  { name: "גוש דן והמרכז", places: "תל אביב, רמת גן, גבעתיים, פתח תקווה, בני ברק" },
  { name: "השפלה", places: "ראשון לציון, רחובות, נס ציונה, יבנה והסביבה" },
  { name: "אזור מודיעין", places: "מודיעין, מכבים־רעות, שוהם והסביבה" },
];

export const INSTALL_DAYS = 14;

/** One line per area, as in the terms and the shipping tab. */
export const installAreasText = INSTALL_AREAS.map((area) => `${area.name}: ${area.places}`).join(". ");
