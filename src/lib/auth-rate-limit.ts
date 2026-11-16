
import { createHmac } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const loginByEmail = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(8, "15 m"),
    prefix: "mintly:login:email",
});

const loginByIp = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "15 m"),
    prefix: "mintly:login:ip",
});

const registerByIp = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "mintly:register:ip",
});

function privateKey(value: string): string {
    const secret = process.env.AUTH_SECRET;

    if (!secret) {
        throw new Error("AUTH_SECRET is required.");
    }

    return createHmac("sha256", secret)
        .update(value)
        .digest("hex");
}

function getClientIp(request: Request): string {
    // Only trust these headers when your hosting proxy
    // sanitizes or controls their values.
    return (
        request.headers
            .get("x-forwarded-for")
            ?.split(",")[0]
            ?.trim() ||
        request.headers.get("x-real-ip")?.trim() ||
        "unknown"
    );
}

export async function checkLoginRateLimit(
    request: Request,
    email: string,
): Promise<boolean> {
    const emailKey = privateKey(email.trim().toLowerCase());
    const ipKey = privateKey(getClientIp(request));

    const [emailResult, ipResult] = await Promise.all([
        loginByEmail.limit(emailKey),
        loginByIp.limit(ipKey),
    ]);

    return emailResult.success && ipResult.success;
}

export async function checkRegisterRateLimit(
    request: Request,
): Promise<boolean> {
    const ipKey = privateKey(getClientIp(request));
    const result = await registerByIp.limit(ipKey);

    return result.success;
}
