// menu-digital/src/routes/__root.tsx — Layout raíz del micrositio
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => <Outlet />,
});
