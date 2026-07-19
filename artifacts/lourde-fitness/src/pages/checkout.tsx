import { type FormEvent, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  CheckCircle2,
  Landmark,
  QrCode,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type PaymentMethod = "qr" | "bank";

type PendingOrder = {
  id: string;
  createdAt: string;
  status: "pending";
  itemType: string;
  title: string;
  option: string;
  slot: string;
  quantity: number;
  amount: number;
  customerName: string;
  email: string;
  phone: string;
  paymentMethod: PaymentMethod;
  transferReference: string;
  proofFileName: string;
};

function getCheckoutParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    itemType: params.get("type") ?? "order",
    title: params.get("title") ?? "",
    option: params.get("option") ?? "",
    slot: params.get("slot") ?? "",
    quantity: Math.max(1, Number(params.get("quantity") ?? 1) || 1),
    amount: Math.max(0, Number(params.get("amount") ?? 0) || 0),
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

function createOrderId() {
  return `LG-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

function savePendingOrder(order: PendingOrder) {
  const raw = window.localStorage.getItem("lourde.pendingOrders");
  const existing = raw ? (JSON.parse(raw) as PendingOrder[]) : [];
  window.localStorage.setItem(
    "lourde.pendingOrders",
    JSON.stringify([order, ...existing]),
  );
}

export function Checkout() {
  const [, setLocation] = useLocation();
  const order = useMemo(() => getCheckoutParams(), []);
  const [step, setStep] = useState<"details" | "payment" | "success">(
    "details",
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qr");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [transferReference, setTransferReference] = useState("");
  const [proofFileName, setProofFileName] = useState("");
  const [submittedOrderId, setSubmittedOrderId] = useState("");

  const hasOrder = Boolean(order.title && order.amount > 0);
  const canContinue =
    customerName.trim() && email.trim() && phone.trim() && hasOrder;
  const canSubmit = Boolean(transferReference.trim() && proofFileName);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;

    const pendingOrder: PendingOrder = {
      id: createOrderId(),
      createdAt: new Date().toISOString(),
      status: "pending",
      itemType: order.itemType,
      title: order.title,
      option: order.option,
      slot: order.slot,
      quantity: order.quantity,
      amount: order.amount,
      customerName,
      email,
      phone,
      paymentMethod,
      transferReference,
      proofFileName,
    };

    savePendingOrder(pendingOrder);
    setSubmittedOrderId(pendingOrder.id);
    setStep("success");
  };

  if (!hasOrder) {
    return (
      <div className="min-h-screen bg-background px-4 py-20">
        <div className="mx-auto max-w-xl rounded-lg border bg-card p-8 text-center">
          <h1 className="font-serif text-3xl text-foreground">
            Nothing to check out yet
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Choose a class or package first, then the checkout will prepare your
            order details automatically.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => setLocation("/classes")}>View Classes</Button>
            <Button variant="outline" onClick={() => setLocation("/packages")}>
              View Packages
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="border-b bg-card py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <button
            type="button"
            onClick={() => setLocation(order.returnTo)}
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Secure Checkout
              </p>
              <h1 className="font-serif text-4xl leading-tight text-foreground md:text-6xl">
                Confirm your booking request.
              </h1>
            </div>
            <p className="max-w-2xl text-base font-light leading-8 text-muted-foreground">
              Pay by QR or bank transfer, then submit your transfer reference
              and proof. Your order stays pending until the studio confirms the
              payment.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <div className="grid grid-cols-3 overflow-hidden rounded-lg border bg-card text-sm font-medium">
              {["Order Information", "Confirm & Pay", "Pending Review"].map(
                (label, index) => {
                  const active =
                    (step === "details" && index === 0) ||
                    (step === "payment" && index === 1) ||
                    (step === "success" && index === 2);

                  return (
                    <div
                      key={label}
                      className={`border-r px-4 py-4 last:border-r-0 ${
                        active ? "bg-foreground text-background" : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </div>
                  );
                },
              )}
            </div>

            {step === "details" && (
              <div className="rounded-lg border bg-card p-6 md:p-8">
                <h2 className="font-serif text-3xl text-foreground">
                  Contact Details
                </h2>
                <div className="mt-8 grid gap-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-muted-foreground">
                      Full name
                    </span>
                    <input
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      className="h-14 w-full rounded-md border bg-background px-4 text-base outline-none focus:ring-2 focus:ring-primary/30"
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
                      className="h-14 w-full rounded-md border bg-background px-4 text-base outline-none focus:ring-2 focus:ring-primary/30"
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
                      className="h-14 w-full rounded-md border bg-background px-4 text-base outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </label>
                </div>
                <Button
                  className="mt-8 h-14 w-full rounded-md bg-foreground text-background hover:bg-foreground/90"
                  disabled={!canContinue}
                  onClick={() => setStep("payment")}
                >
                  Continue to Payment
                </Button>
              </div>
            )}

            {step === "payment" && (
              <form
                onSubmit={handleSubmit}
                className="rounded-lg border bg-card p-6 md:p-8"
              >
                <h2 className="font-serif text-3xl text-foreground">
                  Payment Method
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("qr")}
                    className={`rounded-lg border p-5 text-left transition ${
                      paymentMethod === "qr"
                        ? "border-foreground bg-background shadow-sm"
                        : "bg-card hover:border-primary/40"
                    }`}
                  >
                    <QrCode className="mb-4 h-6 w-6 text-primary" />
                    <div className="font-medium">QR Payment</div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Scan the studio QR code, then upload your proof of
                      transfer.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={`rounded-lg border p-5 text-left transition ${
                      paymentMethod === "bank"
                        ? "border-foreground bg-background shadow-sm"
                        : "bg-card hover:border-primary/40"
                    }`}
                  >
                    <Landmark className="mb-4 h-6 w-6 text-primary" />
                    <div className="font-medium">Bank Transfer</div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Transfer to the studio account and enter the payment
                      reference.
                    </p>
                  </button>
                </div>

                <div className="mt-8 grid gap-6 rounded-lg border bg-background p-5 md:grid-cols-[220px_1fr]">
                  <div className="flex aspect-square items-center justify-center rounded-md border bg-card">
                    <div className="text-center">
                      <QrCode className="mx-auto mb-3 h-16 w-16 text-primary" />
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Studio QR
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm leading-6">
                    <div>
                      <p className="font-semibold text-foreground">
                        Lourde Grove Studio
                      </p>
                      <p className="text-muted-foreground">
                        Send the exact amount shown below, then submit the
                        transfer reference and payment proof for confirmation.
                      </p>
                    </div>
                    <div className="grid gap-2 rounded-md bg-card p-4">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Account name</span>
                        <span className="font-medium text-foreground">
                          Lourde Grove Studio
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Bank</span>
                        <span className="font-medium text-foreground">
                          Studio account details
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium text-foreground">
                          {formatMoney(order.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-muted-foreground">
                      Transfer reference number
                    </span>
                    <input
                      value={transferReference}
                      onChange={(event) =>
                        setTransferReference(event.target.value)
                      }
                      className="h-14 w-full rounded-md border bg-background px-4 text-base outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Reference shown by your bank or wallet"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-muted-foreground">
                      Upload payment proof
                    </span>
                    <div className="flex min-h-24 cursor-pointer items-center justify-center rounded-md border border-dashed bg-background px-4 py-6 text-center">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={(event) =>
                          setProofFileName(
                            event.currentTarget.files?.[0]?.name ?? "",
                          )
                        }
                      />
                      <div>
                        <ReceiptText className="mx-auto mb-3 h-6 w-6 text-primary" />
                        <p className="font-medium text-foreground">
                          {proofFileName || "Choose screenshot or PDF"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Accepted formats: image or PDF receipt.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 flex-1 rounded-md"
                    onClick={() => setStep("details")}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="h-14 flex-[2] rounded-md bg-foreground text-background hover:bg-foreground/90"
                    disabled={!canSubmit}
                  >
                    Submit Payment for Review
                  </Button>
                </div>
              </form>
            )}

            {step === "success" && (
              <div className="rounded-lg border bg-card p-8 text-center md:p-12">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="font-serif text-3xl text-foreground">
                  Payment submitted
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                  Your order is pending studio confirmation. Keep this reference
                  for your records:{" "}
                  <span className="font-semibold text-foreground">
                    {submittedOrderId}
                  </span>
                </p>
                <div className="mt-8 rounded-lg border bg-background p-5 text-left">
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
                    <p className="text-sm leading-6 text-muted-foreground">
                      Once payment is verified against the bank or wallet
                      account, the studio can mark the booking as paid and
                      remove that slot from public availability.
                    </p>
                  </div>
                </div>
                <Button
                  className="mt-8 rounded-md px-8"
                  onClick={() => setLocation("/classes")}
                >
                  Back to Classes
                </Button>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Order Summary
              </p>
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-3xl text-foreground">
                    {order.title}
                  </h2>
                  <p className="mt-2 text-sm capitalize text-muted-foreground">
                    {order.itemType}
                  </p>
                </div>
                {order.option && (
                  <div className="border-t pt-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Selection
                    </p>
                    <p className="mt-2 font-medium text-foreground">
                      {order.option}
                    </p>
                  </div>
                )}
                {order.slot && (
                  <div className="border-t pt-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Date & Time
                    </p>
                    <p className="mt-2 font-medium text-foreground">
                      {order.slot}
                    </p>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">{order.quantity}</span>
                  </div>
                  <div className="mt-4 flex items-end justify-between border-t pt-4">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-serif text-3xl text-primary">
                      {formatMoney(order.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
