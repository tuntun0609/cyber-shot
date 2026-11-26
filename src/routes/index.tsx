import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/site/home-page";
import { loadHome } from "@/lib/catalog/home.functions";

export const Route = createFileRoute("/")({
  component: Home,
  loader: () => loadHome(),
  staleTime: Number.POSITIVE_INFINITY,
});

function Home() {
  return <HomePage data={Route.useLoaderData()} />;
}
