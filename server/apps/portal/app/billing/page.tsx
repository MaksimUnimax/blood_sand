"use client";
import { useEffect, useState } from "react";
import { controlPlane } from "../../lib/control-plane";

type Account = { id: string; displayName: string | null; status: string };
type SubscriptionData = {
  access: { status: "ELIGIBLE" | "INELIGIBLE"; reason: string | null };
  subscription: {
    state: string;
    stateRevision: number;
    plan: { displayName: string; planCode: string; planRevision: number };
    price: {
      amountMinor: number;
      currency: string;
      billingInterval: { unit: string; count: number };
    } | null;
    currentPeriodEnd: string;
    graceUntil: string | null;
  } | null;
  deviceAllowance: {
    maxActive: number | null;
    activeCount: number;
    remaining: number | null;
    overLimit: boolean;
  };
};
type Payment = {
  id: string;
  state: string;
  amountMinor: number;
  currency: string;
  createdAt: string;
  confirmedAt: string | null;
  subscriptionLinked: boolean;
  plan: { displayName: string } | null;
};

export default function Billing() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionData>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void controlPlane("/v1/accounts").then(async (response) => {
      if (!response.ok) {
        location.assign("/login?returnTo=%2Fbilling");
        return;
      }
      const value = (await response.json()).accounts as Account[];
      setAccounts(value);
      if (value[0]) setAccountId(value[0].id);
    });
  }, []);

  useEffect(() => {
    if (!accountId) return;
    setError("");
    void Promise.all([
      controlPlane(
        `/v1/subscription?accountId=${encodeURIComponent(accountId)}`,
      ),
      controlPlane(
        `/v1/billing/payments?accountId=${encodeURIComponent(accountId)}`,
      ),
    ]).then(async ([subscriptionResponse, paymentsResponse]) => {
      if (!subscriptionResponse.ok || !paymentsResponse.ok) {
        setError("Commercial information is unavailable.");
        return;
      }
      setSubscription((await subscriptionResponse.json()) as SubscriptionData);
      setPayments(
        ((await paymentsResponse.json()) as { payments: Payment[] }).payments,
      );
    });
  }, [accountId]);

  const current = subscription?.subscription;
  return (
    <main>
      <h1>Billing</h1>
      <label>
        Account{" "}
        <select
          value={accountId}
          onChange={(event) => setAccountId(event.target.value)}
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.displayName ?? `Account ${account.id.slice(0, 8)}`}{" "}
              {account.status}
            </option>
          ))}
        </select>
      </label>
      {subscription && (
        <>
          <h2>Current subscription</h2>
          <p>
            Access: {subscription.access.status}
            {subscription.access.reason
              ? ` (${subscription.access.reason})`
              : ""}
          </p>
          {current ? (
            <dl>
              <dt>Plan</dt>
              <dd>{current.plan.displayName}</dd>
              <dt>State</dt>
              <dd>{current.state}</dd>
              <dt>Current period ends</dt>
              <dd>{current.currentPeriodEnd}</dd>
              {current.graceUntil && (
                <>
                  <dt>Grace ends</dt>
                  <dd>{current.graceUntil}</dd>
                </>
              )}
              <dt>Price</dt>
              <dd>
                {current.price
                  ? `${current.price.amountMinor} ${current.price.currency} / ${current.price.billingInterval.count} ${current.price.billingInterval.unit}`
                  : "Price: not available"}
              </dd>
            </dl>
          ) : (
            <p>No current subscription.</p>
          )}
          <h2>Device allowance</h2>
          <p>
            Active devices: {subscription.deviceAllowance.activeCount} /{" "}
            {subscription.deviceAllowance.maxActive ?? "unavailable"}
            {subscription.deviceAllowance.overLimit ? " (over limit)" : ""}
          </p>
          <h2>Payment history</h2>
          {payments.length ? (
            <ul>
              {payments.map((payment) => (
                <li key={payment.id}>
                  {payment.state} — {payment.amountMinor} {payment.currency} —{" "}
                  {payment.createdAt}
                </li>
              ))}
            </ul>
          ) : (
            <p>No payments recorded.</p>
          )}
          <p>Online payment is not enabled yet.</p>
        </>
      )}
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
