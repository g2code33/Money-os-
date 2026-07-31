import { Dashboard } from "./components/Dashboard";
import { getDashboardData } from "../lib/db";

export default async function Home() {
  const data = await getDashboardData();
  return <Dashboard {...data} />;
}
