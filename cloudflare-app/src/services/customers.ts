import { getCloudflareContext } from "@opennextjs/cloudflare";

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
  const result = await db.prepare("select * from customers order by CustomerId desc").all();
  return result;
}

export async function deleteCustomers() {
  const { env } = await getCloudflareContext({async: true});
  const db = env.cloudflare_sql;
  const result = await db.prepare("delete from customers").run();
  return result;
}