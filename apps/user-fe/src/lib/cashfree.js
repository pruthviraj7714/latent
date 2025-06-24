import { load } from "@cashfreepayments/cashfree-js";

export async function getCashfreeInstance() {
  const cashfree = await load({ mode: "sandbox" });
  return cashfree;
}
