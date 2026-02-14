import { getCustomers } from "@/services/customers";

import Client from "./client";

export default async function Home() {
	const customers = await getCustomers();
	return (
		<div>
			<Client />
			{JSON.stringify(customers)}
		</div>
	);
}
