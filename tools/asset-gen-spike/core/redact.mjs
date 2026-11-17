// Pure Web-Standard ESM redaction utilities (zero node:* dependencies)
import { sha256Sync } from './json.mjs';

export const SOLAR_URL_QUERY = /(https?:\/\/[^\s"'?#]+)[?#][^\s"']*/g;

export function redactSolar(value) {
  if (typeof value === 'string') {
    return value.replace(SOLAR_URL_QUERY, '$1');
  }
  if (Array.isArray(value)) {
    return value.map(redactSolar);
  }
  if (value && typeof value === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(value)) {
      res[k] = redactSolar(v);
    }
    return res;
  }
  return value;
}

export function receiptTextSolar(stdout, sha256Fn = sha256Sync) {
  try {
    const parsed = JSON.parse(stdout);
    return JSON.stringify(redactSolar(parsed));
  } catch {
    const rawBytes = new TextEncoder().encode(stdout);
    const hash = sha256Fn(rawBytes);
    return JSON.stringify({
      status: 'unparseable',
      note: 'caller stdout was not JSON; withheld to avoid persisting credentials',
      bytes: rawBytes.length,
      sha256: hash
    });
  }
}

export const URL_QUERY_RE = /(https?:\/\/[^\s"'?#<>]*)\?(?!<query-stripped>)[^\s"'<>]*/g;
export const AUTH_RE = /(authorization["']?\s*[:=]\s*["']?)[^\r\n"']+/gi;
export const BEARER_RE = /\bbearer\s+[A-Za-z0-9._~+/=-]+/gi;
export const JWT_RE = /[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;
export const SECRET_KV_RE = /\b((?:access_|refresh_|id_)?token|secret|api[_-]?key|key|password|passwd|sig|signature)(["']?\s*[:=]\s*["']?)([^\s"'&,;}]{6,})/gi;
export const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+/g;

export function redactSecrets(text) {
  if (typeof text !== 'string') return text;
  let out = text.replace(URL_QUERY_RE, '$1?<query-stripped>');
  out = out.replace(AUTH_RE, '$1***');
  out = out.replace(BEARER_RE, 'Bearer ***');
  out = out.replace(JWT_RE, '***');
  return out.replace(SECRET_KV_RE, '$1$2***');
}

export function redactHiggsfield(text) {
  if (typeof text !== 'string') return text;
  return redactSecrets(text).replace(EMAIL_RE, '<redacted>');
}

export function scrubObj(obj) {
  if (typeof obj === 'string') {
    return redactSecrets(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(scrubObj);
  }
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[scrubObj(k)] = scrubObj(v);
    }
    return out;
  }
  return obj;
}

export function urlNoQuery(url) {
  if (typeof url !== 'string') return '';
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return url.replace(/[?#].*$/, '');
  }
}

export function excerpt(text, n = 300) {
  return redactHiggsfield((text || '').trim()).slice(0, n);
}
