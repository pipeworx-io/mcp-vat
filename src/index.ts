interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * VAT-number format validation MCP (EU + UK/CH/NO).
 *
 * Keyless, offline: checks a VAT registration number against the official
 * per-country format (country prefix + length/pattern). No API, no key.
 * SCOPE: format validation only — it does NOT confirm the number is registered
 * or active (that needs the EU VIES service / HMRC). Country-specific check-digit
 * algorithms are not applied; a "valid_format: true" means well-formed, not real.
 */


// country code -> [regex for the number part (after the prefix), country name]
const VAT: Record<string, [RegExp, string]> = {
  AT: [/^U\d{8}$/, 'Austria'], BE: [/^[01]\d{9}$/, 'Belgium'], BG: [/^\d{9,10}$/, 'Bulgaria'],
  HR: [/^\d{11}$/, 'Croatia'], CY: [/^\d{8}[A-Z]$/, 'Cyprus'], CZ: [/^\d{8,10}$/, 'Czechia'],
  DE: [/^\d{9}$/, 'Germany'], DK: [/^\d{8}$/, 'Denmark'], EE: [/^\d{9}$/, 'Estonia'],
  EL: [/^\d{9}$/, 'Greece'], ES: [/^[A-Z0-9]\d{7}[A-Z0-9]$/, 'Spain'], FI: [/^\d{8}$/, 'Finland'],
  FR: [/^[A-Z0-9]{2}\d{9}$/, 'France'], HU: [/^\d{8}$/, 'Hungary'], IE: [/^(\d{7}[A-W]{1,2}|\d[A-Z+*]\d{5}[A-W])$/, 'Ireland'],
  IT: [/^\d{11}$/, 'Italy'], LT: [/^(\d{9}|\d{12})$/, 'Lithuania'], LU: [/^\d{8}$/, 'Luxembourg'],
  LV: [/^\d{11}$/, 'Latvia'], MT: [/^\d{8}$/, 'Malta'], NL: [/^\d{9}B\d{2}$/, 'Netherlands'],
  PL: [/^\d{10}$/, 'Poland'], PT: [/^\d{9}$/, 'Portugal'], RO: [/^\d{2,10}$/, 'Romania'],
  SE: [/^\d{12}$/, 'Sweden'], SI: [/^\d{8}$/, 'Slovenia'], SK: [/^\d{10}$/, 'Slovakia'],
  GB: [/^(\d{9}|\d{12}|(GD|HA)\d{3})$/, 'United Kingdom'], CHE: [/^\d{9}(MWST|TVA|IVA)?$/, 'Switzerland'],
  NO: [/^\d{9}(MVA)?$/, 'Norway'],
};

const tools: McpToolExport['tools'] = [
  {
    name: 'validate_vat',
    description:
      'Validate the FORMAT of a VAT registration number for the EU (+ UK/CH/NO), keyless & offline. Accepts the number with its country prefix ("DE123456789") or a national number plus `country`. Returns whether it matches the official country pattern. NOTE: format only — it does NOT confirm the VAT number is registered/active (use the EU VIES service for that).',
    inputSchema: {
      type: 'object',
      properties: {
        vat: { type: 'string', description: 'A VAT number, e.g. "DE123456789" or "GB123456789".' },
        country: { type: 'string', description: 'Optional 2-letter country code (EL for Greece, GB for UK) if `vat` has no prefix.' },
      },
      required: ['vat'],
    },
  },
  {
    name: 'list_vat_formats',
    description: 'List the supported countries and their VAT-number formats.',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  if (name === 'list_vat_formats') {
    return { count: Object.keys(VAT).length, formats: Object.entries(VAT).map(([cc, [re, country]]) => ({ country_code: cc, country, pattern: re.source })) };
  }
  if (name !== 'validate_vat') throw new Error(`Unknown tool: ${name}`);
  const raw = reqStr(args, 'vat', '"DE123456789"');
  const cleaned = raw.toUpperCase().replace(/[\s.\-]/g, '');
  const forced = typeof args.country === 'string' ? args.country.toUpperCase() : '';

  let cc = '', num = '';
  if (forced && VAT[forced]) { cc = forced; num = cleaned.startsWith(cc) ? cleaned.slice(cc.length) : cleaned; }
  else if (cleaned.startsWith('CHE')) { cc = 'CHE'; num = cleaned.slice(3); }
  else if (VAT[cleaned.slice(0, 2)]) { cc = cleaned.slice(0, 2); num = cleaned.slice(2); }
  else return { input: raw, valid_format: false, reason: 'No recognized VAT country prefix; pass a `country` (e.g. "DE", "EL", "GB").' };

  const [re, country] = VAT[cc];
  const ok = re.test(num);
  return {
    input: raw,
    valid_format: ok,
    country_code: cc,
    country,
    number: num,
    reason: ok ? `Matches the ${country} VAT format.` : `Does not match the ${country} VAT pattern (${re.source}).`,
    note: 'Format only — does not confirm the VAT number is registered/active (use EU VIES / HMRC for that).',
  };
}

function reqStr(args: Record<string, unknown>, key: string, ex: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${ex}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
