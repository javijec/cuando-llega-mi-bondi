import dynamic from "next/dynamic";
import { NearbyStopsMapSkeleton } from "./nearby-stops-map-skeleton";

const NearbyStopsMap = dynamic(
  () => import("./nearby-stops-map").then((mod) => ({ default: mod.NearbyStopsMap })),
  {
    ssr: false,
    loading: () => <NearbyStopsMapSkeleton />,
  },
)

export { NearbyStopsMap, NearbyStopsMapSkeleton }
