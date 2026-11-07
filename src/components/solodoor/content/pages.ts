/**
 * The fixed pages of the site (not articles or products): their address, a name for the admin, and the
 * canonical URL. Used by the SEO screen in the admin and by the sitemap.
 */
export const SITE = "https://solodoor.co.il";

export interface SitePage {
  /** The path as the SEO override key uses it: "seo:" + path. */
  path: string;
  label: string;
  /** The canonical address: the one the site serves (no trailing slash; old addresses with one move here with a 301). */
  url: string;
}

const page = (path: string, label: string, url = `${SITE}${path === "/" ? "/" : path}`): SitePage => ({ path, label, url });

export const SITE_PAGES: SitePage[] = [
  page("/", "דף הבית"),
  page("/ציפוי-דלתות", "ציפוי דלתות"),
  page("/ציפוי-מטבחים", "ציפוי מטבחים"),
  page("/חנות", "החנות (בלי סינון)"),
  page("/טפט-לפי-סגנון", "טפט לפי סגנון"),
  page("/טפט-לפי-סגנון/עצים", "סגנון: עצים"),
  page("/טפט-לפי-סגנון/מומלצים", "סגנון: מומלצים"),
  page("/טפט-לפי-סגנון/חלקים", "סגנון: חלקים"),
  page("/טפט-לפי-סגנון/אבן-ובטון", "סגנון: אבן ובטון"),
  page("/מאמרים", "מאמרים"),
  page("/שאלות-נפוצות", "שאלות נפוצות (בלי סינון)"),
  page("/terms", "תקנון האתר"),
  page("/privacy-policy", "מדיניות פרטיות"),
  page("/accessibility", "הצהרת נגישות"),
];
