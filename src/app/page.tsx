import { cookies } from "next/headers";
import { QueryBuilder } from "../features/query-builder/components/QueryBuilder";

export default async function Home() {
  const theme = (await cookies()).get("buildq-theme")?.value;
  const initialTheme = theme === "dark" || theme === "light" ? theme : "light";

  return <QueryBuilder initialTheme={initialTheme} />;
}
