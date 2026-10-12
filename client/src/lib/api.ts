
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = input.startsWith("http")
    ? input
    : `${API_URL}${input.startsWith("/") ? input : `/${input}`}`;

  const requestInit: RequestInit = {
    ...init,
    credentials: "include",
  };

  let response = await fetch(url, requestInit);

  if (response.status === 401 && !url.endsWith("/auth/refresh")) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      response = await fetch(url, requestInit);
    }
  }

  return response;
}
