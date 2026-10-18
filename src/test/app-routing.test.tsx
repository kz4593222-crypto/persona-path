import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
  it("matches the goal page and continuation", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes("/next").at(-1)?.routeId).toBe("/next");
    expect(router.matchRoutes("/continue").at(-1)?.routeId).toBe("/continue/");
    for (const step of ['age', 'height', 'weight', 'health', 'activity', 'fitness', 'sleep', 'time', 'complete']) {
      expect(router.matchRoutes(`/continue/${step}`).at(-1)?.routeId).toBe('/continue/$step');
    }
  });
});
