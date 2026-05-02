import dynamic from "next/dynamic";
import { ArrivalsRouteMapSkeleton } from "./arrivals-route-map-skeleton";

const ArrivalsRouteMap = dynamic(
  () => import("./arrivals-route-map").then((mod) => ({ default: mod.ArrivalsRouteMap })),
  {
    ssr: false,
    loading: () => <ArrivalsRouteMapSkeleton />,
  },
)

export { ArrivalsRouteMap, ArrivalsRouteMapSkeleton }
