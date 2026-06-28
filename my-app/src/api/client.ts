const BASE_URL = "http://localhost:9090";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
    method?: HttpMethod;
    body?: unknown;
};

export async function request<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { method = "GET", body } = options;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        // "ngrok-skip-browser-warning": "true",
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
    });

    console.log("요청 URL:", `${BASE_URL}${endpoint}`);
    console.log("응답 상태:", response.status);

    if (response.status === 401 || response.status === 403) {
        throw new Error("로그인이 필요합니다.");
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error("에러 응답:", errorText);
        throw new Error(`요청 실패: ${response.status}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}