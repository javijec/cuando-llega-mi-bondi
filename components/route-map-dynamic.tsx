import dynamic from "next/dynamic";
import { RouteMapSkeleton } from "./route-map-skeleton";

const RouteMap = dynamic(
  () => import("./route-map").then((mod) => ({ default: mod.RouteMap })),
  {
    ssr: false,
    loading: () => <RouteMapSkeleton />,
  },
);

export { RouteMap };
