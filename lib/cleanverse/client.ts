const SANDBOX_URL = "https://uatapi.cleanverse.com/api/cooperate";
const API_ID = process.env.CLEANVERSE_API_ID || "";
const API_KEY = process.env.CLEANVERSE_API_KEY || "";

const IV = new Uint8Array(16);

function base64ToBytes(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, "base64").buffer as ArrayBuffer);
}

function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes.buffer as ArrayBuffer).toString("base64");
}

async function encrypt(plaintext: string): Promise<string> {
  const keyBytes = base64ToBytes(API_KEY);
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const key = await crypto.subtle.importKey("raw", keyBytes as BufferSource, { name: "AES-CBC" }, false, ["encrypt"]);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-CBC", iv: IV }, key, data);
  return bytesToBase64(new Uint8Array(ciphertext as ArrayBuffer));
}

async function decrypt(cipherB64: string): Promise<string> {
  const keyBytes = base64ToBytes(API_KEY);
  const cipherBytes = base64ToBytes(cipherB64);
  const key = await crypto.subtle.importKey("raw", keyBytes as BufferSource, { name: "AES-CBC" }, false, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-CBC", iv: IV }, key, cipherBytes as BufferSource);
  return new TextDecoder().decode(plaintext as BufferSource);
}

async function postEncrypted(path: string, body: Record<string, unknown>): Promise<unknown> {
  const json = JSON.stringify(body);
  const data = await encrypt(json);
  const res = await fetch(`${SANDBOX_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-id": API_ID,
    },
    body: JSON.stringify({ data }),
  });
  const result = await res.json();
  if (result.data && typeof result.data === "string" && result.data.length > 0) {
    try {
      const decrypted = await decrypt(result.data);
      return { ...result, data: JSON.parse(decrypted) };
    } catch {
      return result;
    }
  }
  return result;
}

async function postPlain(path: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${SANDBOX_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-id": API_ID,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export interface ApassInfo {
  cvRecordId: string;
  tier: string;
  subTier: number;
  status: number;
  expirationTime: number;
  subGroup: string;
  group: string;
  currentKycHash: string;
}

export interface VerifyResult {
  code: number;
  message: string;
  valid: boolean;
}

export interface ValidatorVerifyResult {
  chain: string;
  contract_address: string;
  user_address: string;
  valid: boolean;
}

export async function queryApass(
  chain: string,
  address: string
): Promise<ApassInfo | null> {
  try {
    if (!API_ID) return null;
    const result = (await postPlain("/query_apass", { chain, address })) as {
      code: string;
      data: ApassInfo;
    };
    if (result.code === "0000") return result.data;
    return null;
  } catch {
    return null;
  }
}

export async function verifyApass(
  chain: string,
  atoken: string,
  address: string
): Promise<VerifyResult | null> {
  try {
    if (!API_ID) return null;
    const result = (await postPlain("/verify_apass", {
      chain,
      atoken,
      address,
    })) as {
      code: string;
      data: { code: number; message: string };
    };
    if (result.code === "0000") {
      return {
        code: result.data.code,
        message: result.data.message,
        valid: result.data.code === 4,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function validatorVerify(
  chain: string,
  contractAddress: string,
  userAddress: string
): Promise<ValidatorVerifyResult | null> {
  try {
    if (!API_ID) return null;
    const result = (await postPlain("/validator/verify", {
      chain,
      contract_address: contractAddress,
      user_address: userAddress,
    })) as {
      code: string;
      data: { chain: string; contract_address: string; user_address: string; valid: boolean };
    };
    if (result.code === "0000") return result.data;
    return null;
  } catch {
    return null;
  }
}

export async function queryInstitutionWhitelist(
  chain: string,
  symbol?: string
): Promise<unknown | null> {
  try {
    if (!API_ID) return null;
    const body: Record<string, string> = { chain };
    if (symbol) body.symbol = symbol;
    const result = (await postPlain("/query_institution_white_list", body)) as {
      code: string;
      data: unknown;
    };
    if (result.code === "0000") return result.data;
    return null;
  } catch {
    return null;
  }
}

export async function queryTxs(
  chain: string,
  address: string,
  limit?: number
): Promise<unknown | null> {
  try {
    if (!API_ID) return null;
    const result = (await postPlain("/query_txs", {
      chain,
      address,
      page: 1,
      pageSize: limit || 25,
    })) as { code: string; data: unknown };
    if (result.code === "0000") return result.data;
    return null;
  } catch {
    return null;
  }
}

export function isConfigured(): boolean {
  return Boolean(API_ID && API_KEY);
}

export interface GenerateApassInput {
  chain: string;
  address: string;
  customerId: string;
  subTier?: number;
  subGroup?: string;
  idType?: string;
}

export interface GenerateApassResult {
  cvRecordId: string;
  atoken: string;
  tier: string;
  status: number;
}

export async function generateApass(
  input: GenerateApassInput
): Promise<GenerateApassResult | null> {
  try {
    if (!API_ID) throw new Error("Cleanverse not configured");
    const body: Record<string, unknown> = {
      chain: input.chain,
      address: input.address,
      customer_id: input.customerId,
    };
    if (input.subTier !== undefined) body.sub_tier = input.subTier;
    if (input.subGroup) body.sub_group = input.subGroup;
    if (input.idType) body.id_type = input.idType;

    const result = (await postPlain("/generate_apass", body)) as {
      code: string;
      data: { cv_record_id: string; atoken: string; tier: string; status: number };
      message?: string;
    };
    if (result.code === "0000" && result.data) {
      return {
        cvRecordId: result.data.cv_record_id,
        atoken: result.data.atoken,
        tier: result.data.tier,
        status: result.data.status,
      };
    }
    console.warn("[Cleanverse] generate_apass failed:", result.code, result.message);
    return null;
  } catch (err) {
    console.error("[Cleanverse] generate_apass error:", err);
    return null;
  }
}

export interface FaucetResult {
  txHash: string;
  amount: string;
  symbol: string;
}

export async function faucetAusdc(
  chain: string,
  address: string
): Promise<FaucetResult | null> {
  try {
    if (!API_ID) throw new Error("Cleanverse not configured");
    const result = (await postPlain("/faucet", {
      chain,
      address,
      symbol: "ausdc",
    })) as {
      code: string;
      data: { tx_hash: string; amount: string; symbol: string };
      message?: string;
    };
    if (result.code === "0000" && result.data) {
      return {
        txHash: result.data.tx_hash,
        amount: result.data.amount,
        symbol: result.data.symbol,
      };
    }
    console.warn("[Cleanverse] faucet failed:", result.code, result.message);
    return null;
  } catch (err) {
    console.error("[Cleanverse] faucet error:", err);
    return null;
  }
}

export interface DepositAddressResult {
  address: string;
  chain: string;
}

export async function queryDepositAddress(
  chain: string,
  userAddress: string
): Promise<DepositAddressResult | null> {
  try {
    if (!API_ID) throw new Error("Cleanverse not configured");
    const result = (await postPlain("/query_deposit_address", {
      chain,
      address: userAddress,
    })) as {
      code: string;
      data: { address: string; chain: string };
    };
    if (result.code === "0000") return result.data;
    return null;
  } catch (err) {
    console.error("[Cleanverse] query_deposit_address error:", err);
    return null;
  }
}
