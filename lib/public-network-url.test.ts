import { describe, expect, test } from "bun:test";
import { isPublicNetworkAddress, validatedPublicHTTPSURL } from "@/lib/public-network-url";

const resolvesTo = (...addresses: string[]) => async () => addresses.map((address) => ({ address, family: address.includes(":") ? 6 : 4 }));

describe("public network URL validation", () => {
  test("accepts an HTTPS destination only when every resolved address is public", async () => {
    expect((await validatedPublicHTTPSURL("https://example.org/status", resolvesTo("93.184.216.34")))?.href).toBe("https://example.org/status");
    expect(await validatedPublicHTTPSURL("https://example.org", resolvesTo("93.184.216.34", "10.0.0.8"))).toBeNull();
    expect(await validatedPublicHTTPSURL("https://unresolved.example.org", async () => [])).toBeNull();
  });

  test("rejects unsafe URL forms before DNS resolution", async () => {
    const lookup = resolvesTo("93.184.216.34");
    for (const value of [
      "http://example.org",
      "https://user:password@example.org",
      "https://example.org:8443",
      "https://localhost",
      "https://service.internal",
      "https://printer.local",
      "not a URL",
    ]) expect(await validatedPublicHTTPSURL(value, lookup)).toBeNull();
  });

  test("rejects private, loopback, link-local, documentation, and reserved IPv4 addresses", () => {
    for (const address of [
      "0.0.0.0", "10.0.0.1", "100.64.0.1", "127.0.0.1", "169.254.169.254",
      "172.16.0.1", "192.0.0.1", "192.0.2.1", "192.168.1.1", "198.18.0.1",
      "198.51.100.1", "203.0.113.1", "224.0.0.1", "255.255.255.255",
    ]) expect(isPublicNetworkAddress(address)).toBe(false);
    expect(isPublicNetworkAddress("8.8.8.8")).toBe(true);
  });

  test("rejects non-public IPv6 addresses and IPv4-mapped loopback", async () => {
    for (const address of ["::", "::1", "::ffff:127.0.0.1", "::ffff:7f00:1", "fc00::1", "fd00::1", "fe80::1", "ff02::1", "2001:db8::1"])
      expect(isPublicNetworkAddress(address)).toBe(false);
    expect((await validatedPublicHTTPSURL("https://[2606:4700:4700::1111]/status"))?.hostname).toBe("[2606:4700:4700::1111]");
    expect(isPublicNetworkAddress("2606:4700:4700::1111")).toBe(true);
  });
});
