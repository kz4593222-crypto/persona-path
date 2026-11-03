import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Dumbbell, Moon, MessagesSquare, UserRound, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { accountQuery, useAccount } from "@/components/dashboard/use-account";

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) => context.queryClient.ensureQueryData(accountQuery),
  head: () => ({ meta: [
    { title: "My Dashboard — Your 30-Day Fitness Plan" },
    { name: "description", content: "Your workouts, recovery guide, community chat and profile in one place." },
    { property: "og:title", content: "My Dashboard — Your 30-Day Fitness Plan" },
    { property: "og:description", content: "Workouts, recovery, community and profile." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  pendingComponent: () => <main className="plan-loading"><p role="status"><Loader2 className="plan-loading-spin" /> Loading your dashboard…</p></main>,
  errorComponent: ({ reset }) => <main className="dash-empty"><h1>Your dashboard didn't load</h1><Button variant="next" onClick={reset}>Try again</Button></main>,
  component: DashboardLayout,
});

const tabs = [
  { to: "/dashboard", label: "Workout", icon: Dumbbell, exact: true },
  { to: "/dashboard/recovery", label: "Recovery", icon: Moon, exact: false },
  { to: "/dashboard/community", label: "Community", icon: MessagesSquare, exact: false },
  { to: "/dashboard/me", label: "Me", icon: UserRound, exact: false },
] as const;

function DashboardLayout() {
  const { data: account } = useAccount();
  return <div className="dash">
    <div className="dash-content">
      {account && !account.fitness ? <main className="dash-empty">
        <p className="plan-eyebrow">Welcome, {account.profile.display_name}</p>
        <h1>Let's build your plan</h1>
        <p>Answer a few quick questions and your 30-day plan, recovery guide and profile will appear here.</p>
        <Button variant="next" asChild><Link to="/">Start now<ArrowRight /></Link></Button>
      </main> : <Outlet />}
    </div>
    <nav className="dash-nav" aria-label="Dashboard sections">
      {tabs.map(({ to, label, icon: Icon, exact }) => <Link key={to} to={to} className="dash-nav-link" activeProps={{ className: "is-active", "aria-current": "page" }} activeOptions={{ exact, includeSearch: false }}>
        <Icon aria-hidden="true" /><span>{label}</span>
      </Link>)}
    </nav>
  </div>;
}
