import { createDefaultQueryState } from "../lib/query-state";
import { userSchema } from "./schema";

export const defaultQuery = createDefaultQueryState(userSchema);
