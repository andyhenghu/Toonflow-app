import axios from "axios";

const DEFAULT_BASE_URL = "http://localhost:3000";
const REGISTER_PATH = "/api/user/register";
const REQUEST_TIMEOUT = 5000;

export interface UserRegisterSyncPayload {
  username: string;
  password: string;
  userId?: number;
}

function getBaseUrl(): string {
  return (process.env.TOONFLOW_REGISTER_SYNC_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function getRegisterUrl(): string {
  const url = new URL(REGISTER_PATH, `${getBaseUrl()}/`);
  url.searchParams.set("turnstile", "");
  return url.toString();
}

export async function syncRegisteredUser(payload: UserRegisterSyncPayload): Promise<void> {
  try {
    await axios.post(
      getRegisterUrl(),
      {
        username: payload.username,
        password: payload.password,
        userId: payload.userId,
      },
      {
        timeout: REQUEST_TIMEOUT,
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[userRegisterSync] sync failed:", message);
  }
}

