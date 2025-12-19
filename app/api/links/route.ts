import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import dns from "dns/promises";

// Comprehensive list of valid TLDs
const VALID_TLDS = new Set([
  "com", "org", "net", "edu", "gov", "mil", "int",
  "us", "uk", "ca", "au", "de", "fr", "jp", "cn", "in", "br", "ru", "it", "es", "mx", "nl", "se", "no", "fi", "dk",
  "io", "ai", "app", "dev", "tech", "cloud", "online", "site", "website", "space", "store", "shop", "blog", "news",
  "info", "biz", "name", "mobi", "asia", "tel", "travel", "jobs", "pro", "coop", "aero", "museum",
  "xyz", "top", "win", "club", "vip", "life", "world", "live", "today", "fun", "art", "design", "studio",
  "agency", "company", "digital", "media", "solutions", "services", "consulting", "marketing", "academy",
  "education", "university", "school", "college", "training", "institute",
  "money", "finance", "bank", "credit", "insurance", "loan", "tax", "accountant",
  "health", "fitness", "dental", "care", "clinic", "doctor", "hospital", "medical", "pharmacy", "surgery",
  "realestate", "property", "homes", "house", "land", "estate", "mortgage",
  "auto", "car", "cars", "motorcycles", "bike", "boats",
  "food", "restaurant", "pizza", "recipes", "cafe", "bar", "pub",
  "fashion", "clothing", "shoes", "jewelry", "boutique",
  "music", "film", "video", "movie", "photo", "camera", "gallery",
  "game", "games", "casino", "poker", "bet", "sport", "football", "soccer", "golf", "hockey",
  "hotel", "vacation", "cruise", "flights", "tours", "holiday",
  "lawyer", "attorney", "legal", "law",
  "engineer", "construction", "contractors", "builders",
  "energy", "solar", "green", "eco",
  "events", "party", "wedding", "christmas",
  "family", "baby", "kids", "toys",
  "pet", "dog", "vet",
  "social", "chat", "email", "link", "network",
  "dating", "singles", "sex", "porn", "adult", "xxx",
  "gifts", "flowers", "diamonds",
  "tools", "equipment", "parts", "supplies",
  "security", "protection", "guard", "safe",
  "cleaning", "plumbing", "electrical", "repair",
  "codes", "software", "computer", "systems", "hosting", "domains", "server",
  "co", "me", "ly", "tv", "cc", "ws", "am", "fm", "to", "be", "at", "nu", "ag", "sh", "ac", "ad", "im",
  "ae", "af", "al", "ar", "bd", "bg", "bo", "by", "cl", "cr", "cz", "do", "ec", "ee", "eg", "gr", "gt",
  "hk", "hr", "hu", "id", "ie", "il", "ir", "is", "ke", "kr", "kz", "lk", "lt", "lu", "lv", "ma", "md", "mk",
  "mt", "my", "ng", "ni", "nz", "pa", "pe", "ph", "pk", "pl", "pt", "py", "qa", "ro", "rs", "sa", "sg", "si",
  "sk", "th", "tn", "tr", "tw", "ua", "uy", "uz", "ve", "vn", "za",
]);

// Normalize URL by adding https:// if missing
function normalizeUrl(url: string): string {
  url = url.trim();
  
  if (!url.match(/^https?:\/\//i)) {
    url = "https://" + url;
  }
  
  return url;
}

// Validate URL format with TLD checking
function isValidUrlFormat(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    if (!urlObj.hostname) {
      return false;
    }
    
    // Special case: localhost
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1' || urlObj.hostname.endsWith('.local')) {
      return true;
    }
    
    if (!urlObj.hostname.includes('.')) {
      return false;
    }
    
    const parts = urlObj.hostname.split('.');
    const tld = parts[parts.length - 1].toLowerCase();
    
    if (tld.length < 2) {
      return false;
    }
    
    if (!VALID_TLDS.has(tld)) {
      return false;
    }
    
    if (!/^[a-zA-Z0-9.-]+$/.test(urlObj.hostname)) {
      return false;
    }
    
    for (const part of parts) {
      if (part.startsWith('-') || part.endsWith('-') || part.length === 0) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}

// Check if domain actually exists via DNS lookup
async function domainExists(hostname: string): Promise<boolean> {
  // Skip DNS check for localhost and local domains
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) {
    return true;
  }

  try {
    // Try to resolve the domain - if it has DNS records, it exists
    await dns.resolve(hostname);
    return true;
  } catch (error) {
    // Try alternative: check if domain has any records (A, AAAA, MX, etc.)
    try {
      await dns.resolve(hostname, 'ANY');
      return true;
    } catch {
      // Domain doesn't exist
      return false;
    }
  }
}

// Validate Google Docs URLs specifically
function isValidGoogleDocsUrl(url: string): boolean {
  const googleDocsPattern = /^https:\/\/docs\.google\.com\/(spreadsheets|document|presentation|forms)\/d\/[a-zA-Z0-9_-]+/;
  return googleDocsPattern.test(url);
}

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    let url: string | null = null;
    let code: string | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      url = body.url;
      code = body.code;
    } else {
      const form = await req.formData();
      url = form.get("url") as string;
      code = form.get("code") as string | null;
    }

    // Validate URL is provided
    if (!url || url.trim() === "") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Normalize URL (add https:// if missing)
    url = normalizeUrl(url);

    // Step 1: Validate URL format and TLD
    if (!isValidUrlFormat(url)) {
      return NextResponse.json(
        { error: "Invalid URL format or domain extension. Please enter a valid website address." },
        { status: 400 }
      );
    }

    // Step 2: Extract hostname for DNS check
    let hostname: string;
    try {
      const urlObj = new URL(url);
      hostname = urlObj.hostname;
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Step 3: Verify domain actually exists via DNS
    const exists = await domainExists(hostname);
    if (!exists) {
      return NextResponse.json(
        { 
          error: `The domain "${hostname}" does not exist or cannot be reached. Please check the URL and try again.` 
        },
        { status: 400 }
      );
    }

    // Special validation for Google Docs URLs
    if (url.includes("docs.google.com")) {
      if (!isValidGoogleDocsUrl(url)) {
        return NextResponse.json(
          {
            error:
              "Invalid Google Docs URL. Must be in format: https://docs.google.com/spreadsheets/d/... (or document/presentation/forms)",
          },
          { status: 400 }
        );
      }
    }

    // Auto-generate random 6-character code if none provided
    if (!code || code.trim() === "") {
      code = Math.random().toString(36).substring(2, 8);
    }

    // Validate code format (alphanumeric, 2-20 chars)
    const codePattern = /^[a-zA-Z0-9_-]{2,20}$/;
    if (!codePattern.test(code)) {
      return NextResponse.json(
        {
          error:
            "Invalid code format. Use 2-20 alphanumeric characters, hyphens, or underscores",
        },
        { status: 400 }
      );
    }

    // Check for duplicate code
    const existing = await prisma.link.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "This code is already in use. Please choose another one." },
        { status: 409 }
      );
    }

    // Create link with normalized URL
    const link = await prisma.link.create({
      data: { code, targetUrl: url },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("Error creating link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
