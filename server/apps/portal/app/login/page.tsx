"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { controlPlane } from "../../lib/control-plane";
import { safeReturnTo } from "../../lib/return-to";
function LoginContent() {
  const router = useRouter(),
    query = useSearchParams(),
    [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [challenge, setChallenge] = useState<string>(),
    [error, setError] = useState("");
  const request = async () => {
    const r = await controlPlane("/v1/auth/otp/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await r.json();
    if (!r.ok) return setError("Unable to request a login code.");
    setChallenge(data.challengeId);
  };
  const verify = async () => {
    if (!challenge) return;
    const r = await controlPlane("/v1/auth/otp/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ challengeId: challenge, code }),
    });
    if (!r.ok) return setError("Invalid or expired code.");
    router.replace(safeReturnTo(query.get("returnTo")));
  };
  return (
    <main>
      <h1>Sign in</h1>
      {!challenge ? (
        <form action={request}>
          <label>
            Email{" "}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>
          <button>Send code</button>
        </form>
      ) : (
        <form action={verify}>
          <label>
            Code{" "}
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]{6}"
              required
            />
          </label>
          <button>Verify</button>
        </form>
      )}
      {error && <p role="alert">{error}</p>}
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
