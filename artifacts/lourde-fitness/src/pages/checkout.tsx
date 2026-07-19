import { type FormEvent, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type CustomerPass = {
  id: string;
  createdAt: string;
  expiresAt: string;
  title: string;
  option: string;
  email: string;
  customerName: string;
  creditsTotal: number;
  creditsBooked: number;
  creditsAvailable: number;
  bookedSlots: string[];
  qrCode: string;
};

type CustomerAccount = {
  email: string;
  username: string;
  password: string;
  createdAt: string;
  name?: string;
  age?: string;
  profileImageDataUrl?: string;
  discountCode?: string;
};

function getCheckoutParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    itemType: params.get("type") ?? "class-pass",
    title: params.get("title") ?? "",
    option: params.get("option") ?? "",
    slot: params.get("slot") ?? "",
    credits: Math.max(1, Number(params.get("credits") ?? 1) || 1),
    bookedSlots: Math.max(0, Number(params.get("bookedSlots") ?? 0) || 0),
    amount: Math.max(0, Number(params.get("amount") ?? 0) || 0),
    accountEmail: params.get("accountEmail") ?? "",
    returnTo: params.get("returnTo") ?? "/classes",
  };
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

function createPassId() {
  return `LG-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

function getExpiryDate() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  return expiry.toISOString();
}

function saveCustomerPass(pass: CustomerPass) {
  const raw = window.localStorage.getItem("lourde.customerPasses");
  const existing = raw ? (JSON.parse(raw) as CustomerPass[]) : [];

  window.localStorage.setItem(
    "lourde.customerPasses",
    JSON.stringify([pass, ...existing]),
  );
  window.localStorage.setItem("lourde.portalEmail", pass.email);
  window.dispatchEvent(new Event("lourde-auth-changed"));
}

function splitSlots(slotText: string) {
  return slotText ? slotText.split(" | ").filter(Boolean) : [];
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getPortalSessionEmail() {
  const raw = window.localStorage.getItem("lourde.portalSession");
  if (!raw) return "";

  try {
    return (JSON.parse(raw) as { email?: string }).email ?? "";
  } catch {
    return "";
  }
}

function getAccount(email: string): CustomerAccount | undefined {
  const raw = window.localStorage.getItem("lourde.customerAccounts");
  const accounts = raw ? (JSON.parse(raw) as CustomerAccount[]) : [];

  return accounts.find((account) => normalize(account.email) === normalize(email));
}

export function Checkout() {
  const [, setLocation] = useLocation();
  const order = useMemo(() => getCheckoutParams(), []);
  const portalEmail = useMemo(() => getPortalSessionEmail(), []);
  const accountEmail = portalEmail || order.accountEmail;
  const account = useMemo(() => getAccount(accountEmail), [accountEmail]);
  const discountRate = portalEmail && account?.discountCode ? 0.1 : 0;
  const discountAmount = Math.round(order.amount * discountRate);
  const amountDue = Math.max(0, order.amount - discountAmount);
  const [customerName, setCustomerName] = useState(account?.name ?? "");
  const [email, setEmail] = useState(accountEmail);
  const [phone, setPhone] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [createdPass, setCreatedPass] = useState<CustomerPass | null>(null);

  const hasOrder = Boolean(order.title && order.amount > 0);
  const canSubmit =
    customerName.trim() &&
    email.trim() &&
    phone.trim() &&
    cardName.trim() &&
    cardNumber.replace(/\s/g, "").length >= 12 &&
    cardExpiry.trim() &&
    cardCvc.trim() &&
    hasOrder;
  const chosenSlots = splitSlots(order.slot);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;

    const checkoutEmail = accountEmail || email;
    const pass: CustomerPass = {
      id: createPassId(),
      createdAt: new Date().toISOString(),
      expiresAt: getExpiryDate(),
      title: order.title,
      option: order.option,
      email: checkoutEmail,
      customerName,
      creditsTotal: order.credits,
      creditsBooked: Math.min(order.bookedSlots, order.credits),
      creditsAvailable: Math.max(0, order.credits - order.bookedSlots),
      bookedSlots: chosenSlots,
      qrCode: `LOURDE-${checkoutEmail.toLowerCase()}-${Date.now()}`,
    };

    saveCustomerPass(pass);
    setCreatedPass(pass);
  };

  if (!hasOrder) {
    return (
      <div className="min-h-screen bg-background px-4 py-20">
        <div className="mx-auto max-w-xl rounded-lg border bg-card p-8 text-center">
          <h1 className="font-serif text-3xl text-foreground">
            Nothing to check out yet
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Choose a class pass first, then checkout will prepare your order.
          </p>
          <Button className="mt-8" onClick={() => setLocation("/classes")}>
            View Classes
          </Button>
        </div>
      </div>
    );
  }

  if (createdPass) {
    return (
      <div className="min-h-screen bg-background px-4 py-20">
        <div className="mx-auto max-w-2xl rounded-lg border bg-card p-8 text-center md:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-4xl text-foreground">
            Pass created
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            We created a customer portal record for{" "}
            <span className="font-medium text-foreground">{createdPass.email}</span>.
            In production, the payment gateway would confirm the card payment
            first, then send this access link by email.
          </p>
          <div className="mt-8 rounded-lg border bg-background p-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Credits
            </p>
            <p className="mt-3 font-serif text-4xl text-foreground">
              {createdPass.creditsAvailable} available /{" "}
              {createdPass.creditsTotal} total
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Expires{" "}
              {new Date(createdPass.expiresAt).toLocaleDateString("en-PH", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="mt-4 rounded-lg border bg-background p-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Receipt ID
            </p>
            <p className="mt-2 font-mono text-sm text-foreground">
              {createdPass.id}
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Use this receipt ID or your checkout email to create your customer
              login.
            </p>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/portal">
              <Button className="rounded-full px-8">Open Customer Portal</Button>
            </Link>
            <Link href="/classes">
              <Button variant="outline" className="rounded-full px-8">
                Buy Another Pass
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="border-b bg-card py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <button
            type="button"
            onClick={() => setLocation(order.returnTo)}
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {portalEmail ? "Member Checkout" : "Guest Checkout"}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-foreground md:text-6xl">
            Complete your class pass.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Enter your payment details. Your class credits will be added to
            {portalEmail ? " your existing portal account." : " the customer portal attached to this email address."}
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border bg-card p-6 md:p-8"
          >
            <h2 className="font-serif text-3xl text-foreground">
              Contact Details
            </h2>
            {portalEmail && (
              <div className="mt-5 rounded-lg border bg-background p-4 text-sm leading-6 text-muted-foreground">
                Buying as{" "}
                <span className="font-medium text-foreground">{portalEmail}</span>.
                Your 10% member discount is applied automatically.
              </div>
            )}
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-muted-foreground">
                  Full name
                </span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="h-14 w-full rounded-md border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-muted-foreground">
                  Email address
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-14 w-full rounded-md border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30"
                  disabled={Boolean(portalEmail)}
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-muted-foreground">
                  Phone number
                </span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+63 912 345 6789"
                  className="h-14 w-full rounded-md border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </label>
            </div>

            <div className="mt-10 border-t pt-8">
              <div className="mb-6 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-3xl text-foreground">
                  Card Information
                </h2>
              </div>
              <div className="grid gap-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-muted-foreground">
                    Name on card
                  </span>
                  <input
                    value={cardName}
                    onChange={(event) => setCardName(event.target.value)}
                    className="h-14 w-full rounded-md border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-muted-foreground">
                    Card number
                  </span>
                  <input
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="h-14 w-full rounded-md border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-muted-foreground">
                      Expiry
                    </span>
                    <input
                      value={cardExpiry}
                      onChange={(event) => setCardExpiry(event.target.value)}
                      placeholder="MM / YY"
                      className="h-14 w-full rounded-md border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-muted-foreground">
                      CVC
                    </span>
                    <input
                      inputMode="numeric"
                      value={cardCvc}
                      onChange={(event) => setCardCvc(event.target.value)}
                      placeholder="123"
                      className="h-14 w-full rounded-md border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-lg border bg-background p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-6 text-muted-foreground">
                  This is a checkout interface only. Real card charging needs
                  Xendit or another payment gateway tokenization flow connected
                  on the backend.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!canSubmit}
              className="mt-8 h-14 w-full rounded-full bg-foreground text-base text-background hover:bg-foreground/90"
            >
              Pay {formatMoney(amountDue)}
            </Button>
          </form>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Order Summary
              </p>
              <h2 className="font-serif text-3xl text-foreground">
                {order.title}
              </h2>
              <p className="mt-2 font-medium text-muted-foreground">
                {order.option}
              </p>
              <div className="mt-6 space-y-4 border-t pt-5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatMoney(order.amount)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Member discount
                    </span>
                    <span className="font-medium text-primary">
                      -{formatMoney(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Class credits</span>
                  <span className="font-medium text-foreground">
                    {order.credits}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booked now</span>
                  <span className="font-medium text-foreground">
                    {chosenSlots.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valid for</span>
                  <span className="font-medium text-foreground">30 days</span>
                </div>
              </div>
              {chosenSlots.length > 0 && (
                <div className="mt-5 border-t pt-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Selected dates
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                    {chosenSlots.map((slot) => (
                      <li key={slot}>{slot}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-6 flex items-end justify-between border-t pt-5">
                <span className="text-muted-foreground">Total</span>
                <span className="font-serif text-3xl text-primary">
                  {formatMoney(amountDue)}
                </span>
              </div>
              <div className="mt-5 flex gap-3 rounded-lg bg-background p-4">
                <Mail className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-xs leading-5 text-muted-foreground">
                  The customer portal is tied to the checkout email. In
                  production, the access link and receipt would be emailed after
                  successful payment confirmation.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
