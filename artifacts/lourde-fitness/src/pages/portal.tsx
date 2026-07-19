import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useLocation } from "wouter";
import {
  BadgePercent,
  CalendarDays,
  ImagePlus,
  LogOut,
  QrCode,
  Settings,
  ShoppingBag,
  TicketCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { classOfferings } from "@/pages/packages";
import {
  isScheduleClassExpired,
  timetableDays,
  type ScheduleClass,
  type TimetableDay,
} from "@/data/timetable";

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
  discountCode: string;
};

type PortalSession = {
  email: string;
  loggedInAt: string;
};

type LoginStep = "identify" | "create-password" | "password";
type PortalTab = "overview" | "redeem" | "credits" | "settings";

const ACCOUNTS_KEY = "lourde.customerAccounts";
const PASSES_KEY = "lourde.customerPasses";
const SESSION_KEY = "lourde.portalSession";
const DEMO_EMAIL = "test@lourdestudio.com";
const DEMO_PASSWORD = "LourdeTest123";

const demoPass: CustomerPass = {
  id: "LG-DEMO-2026",
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  title: "Mat Pilates",
  option: "5 Sessions",
  email: DEMO_EMAIL,
  customerName: "Demo Customer",
  creditsTotal: 5,
  creditsBooked: 1,
  creditsAvailable: 4,
  bookedSlots: ["Monday, 20 Jul · 6:00 PM · Mat Pilates"],
  qrCode: "LOURDE-DEMO-CUSTOMER",
};

const demoAccount: CustomerAccount = {
  email: DEMO_EMAIL,
  username: DEMO_EMAIL,
  password: DEMO_PASSWORD,
  createdAt: new Date().toISOString(),
  name: "Demo Customer",
  age: "29",
  discountCode: "LG10-DEMO26",
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function createDiscountCode(email: string) {
  const seed = normalize(email) || Date.now().toString(36);
  let hash = 0;

  Array.from(seed).forEach((character) => {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  });

  return `LG10-${hash.toString(36).toUpperCase().padStart(6, "0").slice(-6)}`;
}

function normalizeAccount(account: CustomerAccount): CustomerAccount {
  return {
    ...account,
    username: account.username || account.email,
    discountCode: account.discountCode || createDiscountCode(account.email),
  };
}

function getSavedPasses(): CustomerPass[] {
  const raw = window.localStorage.getItem(PASSES_KEY);
  const passes = raw ? (JSON.parse(raw) as CustomerPass[]) : [];
  const hasDemoPass = passes.some((pass) => normalize(pass.email) === DEMO_EMAIL);

  return hasDemoPass ? passes : [demoPass, ...passes];
}

function savePasses(passes: CustomerPass[]) {
  window.localStorage.setItem(PASSES_KEY, JSON.stringify(passes));
}

function getAccounts(): CustomerAccount[] {
  const raw = window.localStorage.getItem(ACCOUNTS_KEY);
  const accounts = raw
    ? (JSON.parse(raw) as CustomerAccount[]).map(normalizeAccount)
    : [];
  const withDemo = accounts.some((account) => normalize(account.email) === DEMO_EMAIL)
    ? accounts
    : [demoAccount, ...accounts];

  saveAccounts(withDemo);
  return withDemo;
}

function saveAccounts(accounts: CustomerAccount[]) {
  window.localStorage.setItem(
    ACCOUNTS_KEY,
    JSON.stringify(accounts.map(normalizeAccount)),
  );
}

function getSession(): PortalSession | null {
  const raw = window.localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as PortalSession) : null;
}

function saveSession(email: string) {
  window.localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ email, loggedInAt: new Date().toISOString() }),
  );
  window.dispatchEvent(new Event("lourde-auth-changed"));
}

function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("lourde-auth-changed"));
}

function resolveIdentifier(identifier: string) {
  const value = normalize(identifier);
  const passes = getSavedPasses();
  const passByReceipt = passes.find(
    (pass) => normalize(pass.id) === value || normalize(pass.qrCode) === value,
  );

  if (passByReceipt) {
    return {
      email: passByReceipt.email,
      passes: passes.filter(
        (pass) => normalize(pass.email) === normalize(passByReceipt.email),
      ),
    };
  }

  return {
    email: identifier.trim(),
    passes: passes.filter((pass) => normalize(pass.email) === value),
  };
}

function findAccountByEmail(email: string) {
  return getAccounts().find((account) => normalize(account.email) === normalize(email));
}

function formatDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function isPassActive(pass: CustomerPass) {
  return pass.creditsAvailable > 0 && new Date(pass.expiresAt).getTime() >= Date.now();
}

function getOfferingSlug(title: string) {
  return classOfferings.find((offering) => offering.title === title)?.slug ?? "";
}

function getSlotText(day: TimetableDay, classItem: ScheduleClass) {
  return `${day.fullLabel} · ${classItem.time} · ${classItem.title}`;
}

function buildCheckoutHref(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return `/checkout?${searchParams.toString()}`;
}

function getSoonestExpiry(passes: CustomerPass[]) {
  return passes
    .map((pass) => pass.expiresAt)
    .sort((first, second) => new Date(first).getTime() - new Date(second).getTime())[0];
}

function FakeQr({ code }: { code: string }) {
  const cells = Array.from({ length: 49 }, (_, index) => {
    const charCode = code.charCodeAt(index % code.length);
    return (charCode + index) % 3 !== 0;
  });

  return (
    <div className="grid h-28 w-28 grid-cols-7 gap-1 rounded-lg border bg-background p-3">
      {cells.map((filled, index) => (
        <span
          key={`${code}-${index}`}
          className={filled ? "rounded-sm bg-foreground" : "rounded-sm bg-muted"}
        />
      ))}
    </div>
  );
}

export function PortalLogin({
  onLoginSuccess,
}: {
  onLoginSuccess?: (session: PortalSession) => void;
}) {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<LoginStep>("identify");
  const [identifier, setIdentifier] = useState("");
  const [resolvedEmail, setResolvedEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleIdentify = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const result = resolveIdentifier(identifier);

    if (!result.email || result.passes.length === 0) {
      setMessage(
        "We could not find a purchase for that email or receipt ID. Complete checkout first, then create your login.",
      );
      return;
    }

    setResolvedEmail(result.email);

    if (findAccountByEmail(result.email)) {
      setStep("password");
    } else {
      setStep("create-password");
    }
  };

  const handleCreatePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const accounts = getAccounts();
    saveAccounts([
      ...accounts.filter(
        (account) => normalize(account.email) !== normalize(resolvedEmail),
      ),
      {
        email: resolvedEmail,
        username: resolvedEmail,
        password,
        createdAt: new Date().toISOString(),
        discountCode: createDiscountCode(resolvedEmail),
      },
    ]);
    saveSession(resolvedEmail);
    const nextSession = getSession();
    if (nextSession) {
      onLoginSuccess?.(nextSession);
    }
    setLocation("/portal");
  };

  const handlePasswordLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const account = findAccountByEmail(resolvedEmail);

    if (!account || account.password !== password) {
      setMessage(
        "Those login details do not match. Try again or request a reset email.",
      );
      return;
    }

    saveSession(account.email);
    const nextSession = getSession();
    if (nextSession) {
      onLoginSuccess?.(nextSession);
    }
    setLocation("/portal");
  };

  const handleReset = () => {
    setMessage(
      `Password reset instructions would be sent to ${resolvedEmail}. Email delivery needs to be connected before this can send for real.`,
    );
  };

  return (
    <div className="min-h-screen bg-background px-4 py-20">
      <div className="mx-auto max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          Customer Login
        </p>
        <h1 className="text-center font-serif text-4xl text-foreground">
          Your Classes
        </h1>
        <p className="mt-4 text-center text-sm leading-6 text-muted-foreground">
          Use the email from checkout or a receipt ID. Existing customers log in
          with a password; first-time customers set one.
        </p>

        {step === "identify" && (
          <form onSubmit={handleIdentify} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted-foreground">
                Email or receipt ID
              </span>
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="you@example.com or LG-..."
                className="h-14 w-full rounded-md border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </label>
            <Button className="h-12 w-full rounded-full" type="submit">
              Continue
            </Button>
          </form>
        )}

        {step === "create-password" && (
          <form onSubmit={handleCreatePassword} className="mt-8 space-y-5">
            <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
              Create a password for{" "}
              <span className="font-medium text-foreground">{resolvedEmail}</span>.
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted-foreground">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-14 w-full rounded-md border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted-foreground">
                Confirm password
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-14 w-full rounded-md border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </label>
            <Button className="h-12 w-full rounded-full" type="submit">
              Create Login
            </Button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handlePasswordLogin} className="mt-8 space-y-5">
            <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
              Log in as{" "}
              <span className="font-medium text-foreground">{resolvedEmail}</span>.
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted-foreground">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-14 w-full rounded-md border bg-background px-4 outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </label>
            <Button className="h-12 w-full rounded-full" type="submit">
              Log In
            </Button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full text-center text-sm font-medium text-primary hover:text-primary/80"
            >
              Send password reset email
            </button>
          </form>
        )}

        {message && (
          <div className="mt-5 rounded-lg border bg-background p-4 text-sm leading-6 text-muted-foreground">
            {message}
          </div>
        )}

        {step !== "identify" && (
          <button
            type="button"
            onClick={() => {
              setStep("identify");
              setPassword("");
              setConfirmPassword("");
              setMessage("");
            }}
            className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-primary"
          >
            Use a different email or receipt ID
          </button>
        )}
      </div>
    </div>
  );
}

export function Portal() {
  const [, setLocation] = useLocation();
  const [session, setSession] = useState<PortalSession | null>(getSession);
  const [passes, setPasses] = useState<CustomerPass[]>(getSavedPasses);
  const [accounts, setAccounts] = useState<CustomerAccount[]>(getAccounts);
  const [activeTab, setActiveTab] = useState<PortalTab>("overview");
  const [message, setMessage] = useState("");

  const email = session?.email ?? "";
  const account = useMemo(
    () =>
      accounts.find((item) => normalize(item.email) === normalize(email)) ??
      normalizeAccount({
        email,
        username: email,
        password: "",
        createdAt: new Date().toISOString(),
        discountCode: createDiscountCode(email),
      }),
    [accounts, email],
  );
  const [settingsForm, setSettingsForm] = useState({
    name: account.name ?? "",
    age: account.age ?? "",
    email: account.email ?? "",
    profileImageDataUrl: account.profileImageDataUrl ?? "",
  });

  useEffect(() => {
    setSettingsForm({
      name: account.name ?? "",
      age: account.age ?? "",
      email: account.email ?? "",
      profileImageDataUrl: account.profileImageDataUrl ?? "",
    });
  }, [account.email, account.name, account.age, account.profileImageDataUrl]);

  const matchingPasses = useMemo(
    () =>
      passes.filter(
        (pass) => pass.email.toLowerCase() === email.trim().toLowerCase(),
      ),
    [email, passes],
  );
  const activePasses = matchingPasses.filter(isPassActive);
  const totalCredits = activePasses.reduce(
    (sum, pass) => sum + pass.creditsAvailable,
    0,
  );
  const bookedCount = activePasses.reduce((sum, pass) => sum + pass.creditsBooked, 0);
  const classBalances = useMemo(
    () =>
      classOfferings
        .map((offering) => {
          const offeringPasses = activePasses.filter(
            (pass) => getOfferingSlug(pass.title) === offering.slug,
          );
          const creditsAvailable = offeringPasses.reduce(
            (sum, pass) => sum + pass.creditsAvailable,
            0,
          );
          const creditsBooked = offeringPasses.reduce(
            (sum, pass) => sum + pass.creditsBooked,
            0,
          );

          return {
            offering,
            passes: offeringPasses,
            creditsAvailable,
            creditsBooked,
            expiresAt: getSoonestExpiry(offeringPasses),
            qrCode: offeringPasses[0]?.qrCode,
          };
        })
        .filter((balance) => balance.creditsAvailable > 0),
    [activePasses],
  );

  const redeemSlots = useMemo(
    () =>
      timetableDays.flatMap((day) =>
        day.classes
          .filter((classItem) => !isScheduleClassExpired(day, classItem))
          .map((classItem) => {
            const slotText = getSlotText(day, classItem);
            const localBookings = passes.reduce(
              (sum, pass) =>
                sum + pass.bookedSlots.filter((slot) => slot === slotText).length,
              0,
            );
            const remaining = Math.max(
              0,
              classItem.capacity - classItem.booked - localBookings,
            );
            const eligiblePass = activePasses.find(
              (pass) => getOfferingSlug(pass.title) === classItem.packageSlug,
            );

            return {
              id: `${day.key}-${classItem.id}`,
              day,
              classItem,
              slotText,
              remaining,
              eligiblePass,
            };
          }),
      ),
    [activePasses, passes],
  );

  const refreshPortal = () => {
    setPasses(getSavedPasses());
    setAccounts(getAccounts());
    setSession(getSession());
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setLocation("/sign-in");
  };

  const handleRedeem = (
    slotText: string,
    classItem: ScheduleClass,
    pass: CustomerPass | undefined,
  ) => {
    if (!pass) return;

    const nextPasses = passes.map((item) => {
      if (item.id !== pass.id) return item;

      return {
        ...item,
        creditsAvailable: Math.max(0, item.creditsAvailable - 1),
        creditsBooked: item.creditsBooked + 1,
        bookedSlots: [...item.bookedSlots, slotText],
      };
    });

    savePasses(nextPasses);
    setPasses(nextPasses);
    setMessage(`${classItem.title} has been booked using 1 credit.`);
    setActiveTab("overview");
  };

  const handleProfileImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSettingsForm((current) => ({
        ...current,
        profileImageDataUrl: String(reader.result),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextEmail = normalize(settingsForm.email);
    const currentEmail = normalize(email);

    if (!nextEmail) {
      setMessage("Email address is required.");
      return;
    }

    const duplicate = accounts.some(
      (item) => normalize(item.email) === nextEmail && normalize(item.email) !== currentEmail,
    );

    if (duplicate) {
      setMessage("That email is already attached to another Lourde account.");
      return;
    }

    const nextAccount: CustomerAccount = {
      ...account,
      email: settingsForm.email.trim(),
      username: settingsForm.email.trim(),
      name: settingsForm.name.trim(),
      age: settingsForm.age.trim(),
      profileImageDataUrl: settingsForm.profileImageDataUrl,
    };
    const nextAccounts = [
      ...accounts.filter((item) => normalize(item.email) !== currentEmail),
      nextAccount,
    ];
    const nextPasses = passes.map((pass) =>
      normalize(pass.email) === currentEmail
        ? {
            ...pass,
            email: nextAccount.email,
            customerName: nextAccount.name || pass.customerName,
          }
        : pass,
    );

    saveAccounts(nextAccounts);
    savePasses(nextPasses);
    saveSession(nextAccount.email);
    setAccounts(nextAccounts);
    setPasses(nextPasses);
    setSession(getSession());
    setMessage("Account settings updated.");
  };

  if (!session) {
    return (
      <PortalLogin
        onLoginSuccess={(nextSession) => {
          setSession(nextSession);
          setPasses(getSavedPasses());
          setAccounts(getAccounts());
        }}
      />
    );
  }

  const tabs: { id: PortalTab; label: string; icon: typeof TicketCheck }[] = [
    { id: "overview", label: "Overview", icon: TicketCheck },
    { id: "redeem", label: "Redeem Classes", icon: CalendarDays },
    { id: "credits", label: "Add Credits", icon: ShoppingBag },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="border-b bg-card py-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-background">
                {account.profileImageDataUrl ? (
                  <img
                    src={account.profileImageDataUrl}
                    alt={account.name || account.email}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-7 w-7 text-primary" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Customer Portal
                </p>
                <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl">
                  {account.name || "My Lourde Account"}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">{email}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="w-fit gap-2 rounded-full"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 grid gap-3 rounded-lg border bg-card p-2 sm:grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setMessage("");
                }}
                className={`flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {message && (
          <div className="mb-6 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
            {message}
          </div>
        )}

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6">
                <TicketCheck className="mb-4 h-6 w-6 text-primary" />
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Available Credits
                </p>
                <p className="mt-2 font-serif text-5xl text-foreground">
                  {totalCredits}
                </p>
                {classBalances.length > 0 && (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    {classBalances.map((balance) => (
                      <div
                        key={balance.offering.slug}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {balance.offering.title}
                        </span>
                        <span className="font-medium text-foreground">
                          {balance.creditsAvailable}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-lg border bg-card p-6">
                <CalendarDays className="mb-4 h-6 w-6 text-primary" />
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Booked Classes
                </p>
                <p className="mt-2 font-serif text-5xl text-foreground">
                  {bookedCount}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <BadgePercent className="mb-4 h-6 w-6 text-primary" />
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Member Discount
                </p>
                <p className="mt-3 font-mono text-xl font-semibold text-foreground">
                  {account.discountCode}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  10% off future credit purchases.
                </p>
              </div>
            </div>

            {classBalances.length === 0 ? (
              <div className="rounded-lg border bg-card p-10 text-center">
                <CalendarDays className="mx-auto mb-4 h-8 w-8 text-primary" />
                <h2 className="font-serif text-3xl text-foreground">
                  No active credits left
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  Expired passes and fully used passes are hidden here. Add
                  credits for the class you want and they will stay attached to
                  this account.
                </p>
                <Button
                  className="mt-6 rounded-full px-8"
                  onClick={() => setActiveTab("credits")}
                >
                  Add Credits
                </Button>
              </div>
            ) : (
              <div className="grid gap-5">
                {classBalances.map((balance) => (
                  <article
                    key={balance.offering.slug}
                    className="grid gap-6 rounded-lg border bg-card p-5 md:grid-cols-[1fr_auto] md:p-6"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                        {balance.offering.eyebrow}
                      </p>
                      <h2 className="mt-3 font-serif text-3xl text-foreground">
                        {balance.offering.title}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {balance.offering.summary}
                      </p>
                      <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em]">
                            Available
                          </p>
                          <p className="mt-1 text-xl font-semibold text-foreground">
                            {balance.creditsAvailable}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em]">
                            Booked
                          </p>
                          <p className="mt-1 text-xl font-semibold text-foreground">
                            {balance.creditsBooked}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em]">
                            Expires
                          </p>
                          <p className="mt-1 text-xl font-semibold text-foreground">
                            {balance.expiresAt ? formatDate(balance.expiresAt) : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 rounded-lg bg-background p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Active Receipts
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {balance.passes.map((pass) => (
                            <div
                              key={pass.id}
                              className="rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground"
                            >
                              <span className="block font-medium text-foreground">
                                {pass.option}
                              </span>
                              <span>{pass.creditsAvailable} credit</span>
                              <span>{pass.creditsAvailable === 1 ? "" : "s"}</span>
                              <span> · {pass.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button
                          className="rounded-full px-8"
                          onClick={() => setActiveTab("redeem")}
                        >
                          Redeem {balance.offering.title}
                        </Button>
                        <Button
                          className="rounded-full px-8"
                          variant="outline"
                          onClick={() => setActiveTab("credits")}
                        >
                          Add More Credits
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
                      <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-5">
                        {balance.qrCode && <FakeQr code={balance.qrCode} />}
                        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
                          <QrCode className="h-4 w-4 text-primary" />
                          Check-in QR
                        </div>
                      </div>
                      <div className="flex flex-col justify-center rounded-lg border bg-background p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                          Your Code
                        </p>
                        <p className="mt-3 font-mono text-lg font-semibold text-foreground">
                          {account.discountCode}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          Use this account code for 10% off future orders.
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "redeem" && (
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Timetable
                </p>
                <h2 className="mt-2 font-serif text-4xl text-foreground">
                  Redeem a class
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                Credits can only be used for the class type they were purchased
                for. Expired passes are hidden from redemption.
              </p>
            </div>

            <div className="grid gap-3">
              {redeemSlots.map((slot) => {
                const canRedeem = Boolean(slot.eligiblePass) && slot.remaining > 0;
                const canBuy = !slot.eligiblePass && slot.remaining > 0;

                return (
                  <article
                    key={slot.id}
                    className="grid gap-4 rounded-lg border bg-background p-4 md:grid-cols-[9rem_1fr_auto] md:items-center"
                  >
                    <div>
                      <p className="font-serif text-3xl text-foreground">
                        {slot.classItem.time}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {slot.classItem.duration}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        {slot.day.fullLabel}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-foreground">
                        {slot.classItem.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {slot.remaining} remaining · Lourde Grove Studio
                      </p>
                    </div>
                    <Button
                      type="button"
                      disabled={!canRedeem && !canBuy}
                      onClick={() => {
                        if (canRedeem) {
                          handleRedeem(slot.slotText, slot.classItem, slot.eligiblePass);
                          return;
                        }

                        setActiveTab("credits");
                      }}
                      className="rounded-full px-7"
                      variant={canRedeem ? "default" : "outline"}
                    >
                      {canRedeem
                        ? "Redeem Credit"
                        : canBuy
                          ? "Buy Credits"
                          : "Class Full"}
                    </Button>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "credits" && (
          <div>
            <div className="mb-6 rounded-lg border bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Add Credits
              </p>
              <h2 className="mt-2 font-serif text-4xl text-foreground">
                Choose the class you want.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Credits are class-specific. Karate credits redeem Karate only,
                Pilates credits redeem the Pilates class purchased, and each
                pass expires 30 days after checkout.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {classOfferings.map((offering) => (
                <article key={offering.slug} className="rounded-lg border bg-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                        {offering.eyebrow}
                      </p>
                      <h2 className="mt-3 font-serif text-3xl text-foreground">
                        {offering.title}
                      </h2>
                    </div>
                    <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
                      {classBalances.find(
                        (balance) => balance.offering.slug === offering.slug,
                      )?.creditsAvailable ?? 0}{" "}
                      left
                    </span>
                  </div>
                  <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
                    {offering.summary}
                  </p>
                  <div className="mt-5 space-y-3 border-t pt-4">
                    {offering.passes.map((pass) => {
                      const checkoutHref = buildCheckoutHref({
                        type: "class-pass",
                        title: offering.title,
                        option: pass.label,
                        credits: pass.sessions,
                        bookedSlots: 0,
                        amount: pass.price,
                        accountEmail: email,
                        returnTo: "/portal",
                      });

                      return (
                        <Link key={pass.id} href={checkoutHref} className="block">
                          <div className="flex items-center justify-between gap-4 rounded-md border bg-background px-4 py-3 transition hover:border-primary/40">
                            <span>
                              <span className="block text-sm font-medium text-foreground">
                                {pass.label}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {pass.sessions} credit
                                {pass.sessions === 1 ? "" : "s"} · 30 days
                              </span>
                            </span>
                            <span className="font-serif text-xl text-primary">
                              {formatMoney(pass.price)}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <form
            onSubmit={handleSaveSettings}
            className="mx-auto grid max-w-4xl gap-6 rounded-lg border bg-card p-6 md:grid-cols-[16rem_1fr] md:p-8"
          >
            <div>
              <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border bg-background">
                {settingsForm.profileImageDataUrl ? (
                  <img
                    src={settingsForm.profileImageDataUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-primary" />
                )}
              </div>
              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40">
                <ImagePlus className="h-4 w-4 text-primary" />
                Profile photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImage}
                  className="sr-only"
                />
              </label>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Account Settings
              </p>
              <h2 className="mt-2 font-serif text-4xl text-foreground">
                Your details
              </h2>
              <div className="mt-6 grid gap-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-muted-foreground">
                    Full name
                  </span>
                  <input
                    value={settingsForm.name}
                    onChange={(event) =>
                      setSettingsForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="h-13 w-full rounded-md border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-muted-foreground">
                      Email address
                    </span>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className="h-13 w-full rounded-md border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-muted-foreground">
                      Age
                    </span>
                    <input
                      inputMode="numeric"
                      value={settingsForm.age}
                      onChange={(event) =>
                        setSettingsForm((current) => ({
                          ...current,
                          age: event.target.value,
                        }))
                      }
                      className="h-13 w-full rounded-md border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                </div>
              </div>
              <Button className="mt-8 rounded-full px-8" type="submit">
                Save Settings
              </Button>
              <Button
                className="ml-3 mt-8 rounded-full px-8"
                type="button"
                variant="outline"
                onClick={refreshPortal}
              >
                Refresh
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
