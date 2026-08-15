import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { isIP, type LookupFunction } from "node:net";

type ResolvedAddress = { address: string; family: number };
type AddressLookup = (hostname: string) => Promise<ResolvedAddress[]>;

const blockedHostnameSuffixes = [
  ".internal",
  ".invalid",
  ".lan",
  ".local",
  ".localhost",
  ".test",
];

function isPublicIPv4(address: string) {
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false;
  const [first, second, third] = octets;

  if (first === 0 || first === 10 || first === 127 || first >= 224) return false;
  if (first === 100 && second >= 64 && second <= 127) return false;
  if (first === 169 && second === 254) return false;
  if (first === 172 && second >= 16 && second <= 31) return false;
  if (first === 192 && second === 0 && third === 0) return false;
  if (first === 192 && second === 0 && third === 2) return false;
  if (first === 192 && second === 168) return false;
  if (first === 198 && (second === 18 || second === 19)) return false;
  if (first === 198 && second === 51 && third === 100) return false;
  if (first === 203 && second === 0 && third === 113) return false;
  return true;
}

function isPublicIPv6(address: string) {
  const normalized = address.toLowerCase().split("%")[0];
  const mappedIPv4 = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  if (mappedIPv4) return isPublicIPv4(mappedIPv4);
  const mappedHex = normalized.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mappedHex) {
    const high = Number.parseInt(mappedHex[1], 16);
    const low = Number.parseInt(mappedHex[2], 16);
    return isPublicIPv4(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`);
  }
  if (normalized === "::" || normalized === "::1") return false;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return false;
  if (/^fe[89ab]/.test(normalized)) return false;
  if (normalized.startsWith("ff")) return false;
  if (normalized.startsWith("2001:db8:")) return false;
  return true;
}

export function isPublicNetworkAddress(address: string) {
  const family = isIP(address.split("%")[0]);
  if (family === 4) return isPublicIPv4(address);
  if (family === 6) return isPublicIPv6(address);
  return false;
}

async function systemLookup(hostname: string) {
  return lookup(hostname, { all: true, verbatim: true });
}

async function resolvePublicHTTPSURL(value: string, addressLookup: AddressLookup) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (
    url.protocol !== "https:"
    || (url.port && url.port !== "443")
    || url.username
    || url.password
    || !hostname
    || hostname === "localhost"
    || blockedHostnameSuffixes.some((suffix) => hostname.endsWith(suffix))
  ) return null;

  if (isIP(hostname)) return isPublicNetworkAddress(hostname) ? { url, addresses: [{ address: hostname, family: isIP(hostname) }] } : null;

  try {
    const addresses = await addressLookup(hostname);
    if (!addresses.length || addresses.some(({ address }) => !isPublicNetworkAddress(address))) return null;
    return { url, addresses };
  } catch {
    return null;
  }
}

export async function validatedPublicHTTPSURL(value: string, addressLookup: AddressLookup = systemLookup) {
  return (await resolvePublicHTTPSURL(value, addressLookup))?.url ?? null;
}

export async function publicHTTPSHead(value: string, timeoutMilliseconds = 5_000) {
  const target = await resolvePublicHTTPSURL(value, systemLookup);
  if (!target) return null;
  const addresses = target.addresses.map(({ address, family }) => ({ address, family: family === 6 ? 6 : 4 }));
  const pinnedLookup: LookupFunction = (_hostname, options, callback) => {
    const requestedFamily = typeof options.family === "number" && options.family ? options.family : null;
    const candidates = requestedFamily ? addresses.filter(({ family }) => family === requestedFamily) : addresses;
    if (!candidates.length) {
      const error = Object.assign(new Error("No validated address for the requested family"), { code: "ENOTFOUND" });
      callback(error, "", 0);
      return;
    }
    if (options.all) callback(null, candidates);
    else callback(null, candidates[0].address, candidates[0].family);
  };

  const status = await new Promise<number | null>((resolve) => {
    const outbound = request(target.url, { method: "HEAD", agent: false, lookup: pinnedLookup }, (response) => {
      response.resume();
      resolve(response.statusCode ?? null);
    });
    outbound.setTimeout(timeoutMilliseconds, () => outbound.destroy(new Error("Deployment check timed out")));
    outbound.on("error", () => resolve(null));
    outbound.end();
  });
  return { url: target.url, status };
}
