'use strict';

/**
 * Browser hygiene: stop the page from being told it is driven by an automated
 * headless browser.
 *
 * Measured 2026-10-13, same machine, same address, same inbox domain, same
 * headless Chrome, one variable:
 *
 *   as launched — `HeadlessChrome/155.0.0.0` in the User-Agent   → "Access blocked, please contact support."
 *   same page with the UA rewritten to plain Chrome              → "Verify your email — enter the code …"
 *
 * WorkOS Radar's refusal was therefore not the exit address: a UA that says
 * "HeadlessChrome" was enough to refuse a gmail.com sign-up from a residential
 * line. `navigator.webdriver` already reads `false` on current headless Chrome,
 * so the UA alone carried the signal — which is also why this module overrides
 * the UA and nothing else.
 *
 * The override is per page (per browser context): the operator's Chrome is not
 * modified, and a page not created through here is untouched.
 */

/** Plain-Chrome product token from whatever the browser reports. */
function plainUserAgent(userAgent) {
  return String(userAgent)
    .replace(/HeadlessChrome\//g, 'Chrome/')
    .replace(/HeadlessEdg\//g, 'Edg/')
    .replace(/Headless(?=Chromium|Firefox)/gi, '');
}

/** True when the UA admits to being headless — i.e. hygiene has work to do. */
function advertisesHeadless(userAgent) {
  return /Headless/i.test(String(userAgent));
}

/** `RIVER_BULK_VIEWPORT=1440x900` -> device metrics override for one account. */
function parseViewport(spec) {
  const m = String(spec || '').match(/^(\d{3,5})\s*[x,]\s*(\d{3,5})$/);
  return m ? { width: parseInt(m[1], 10), height: parseInt(m[2], 10) } : null;
}

const FALLBACK_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/** Resolves the plain UA once per CDP connection. */
async function resolveUserAgent(cdp, supplied) {
  if (supplied) return String(supplied);
  if (cdp.__plainUserAgent) return cdp.__plainUserAgent;
  let ua = process.env.RIVER_BULK_USER_AGENT || '';
  if (!ua) {
    try {
      const v = await cdp.send('Browser.getVersion', {}, null);
      ua = plainUserAgent(v.userAgent || v.product || '');
    } catch (e) {
      ua = FALLBACK_UA;
    }
  }
  cdp.__plainUserAgent = ua;
  return ua;
}

/**
 * Applies the per-page override. Call before the first navigation.
 *
 * @param {object} cdp
 * @param {string} sessionId page session
 * @param {{userAgent?: string, acceptLanguage?: string, platform?: string, timezone?: string, viewport?: object, log?: Function}} opts
 */
async function applyHygiene(cdp, sessionId, opts = {}) {
  const {
    acceptLanguage = process.env.RIVER_BULK_ACCEPT_LANGUAGE || 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    platform = process.env.RIVER_BULK_PLATFORM || 'Win32',
    timezone = process.env.RIVER_BULK_TIMEZONE || null,
    viewport = parseViewport(process.env.RIVER_BULK_VIEWPORT),
    log,
  } = opts;
  const userAgent = await resolveUserAgent(cdp, opts.userAgent);
  await cdp.send('Emulation.setUserAgentOverride', { userAgent, acceptLanguage, platform }, sessionId);
  // A bulk run gives every account its own timezone and viewport, matched to
  // the exit's country; a bare single run has neither and is left untouched.
  if (timezone) await cdp.send('Emulation.setTimezoneOverride', { timezoneId: timezone }, sessionId).catch(() => {});
  if (viewport)
    await cdp
      .send('Emulation.setDeviceMetricsOverride', { ...viewport, deviceScaleFactor: 1, mobile: false }, sessionId)
      .catch(() => {});
  if (log) log(`browser hygiene: UA announced as "${userAgent.split(') ').pop()}"`);
  return { userAgent, acceptLanguage, timezone, viewport };
}

module.exports = { applyHygiene, plainUserAgent, advertisesHeadless, resolveUserAgent, parseViewport, FALLBACK_UA };
