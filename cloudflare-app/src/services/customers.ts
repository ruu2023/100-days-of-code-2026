import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";

export async function createCustomer(company: string, contact: string) {
  const { env } = await getCloudflareContext({async: true});
  const db = env.cloudflare_sql;
  const stmt = db.prepare("insert into customers (CompanyName, ContactName) values (?, ?)");
  const result = await stmt.bind(company, contact).run();
  return result;
}

export async function getCustomers() {
  const { env } = await getCloudflareContext({async: true});  
  const db = env.cloudflare_sql;
  const result = await db.prepare("select * from customers").all();
  return result;
}