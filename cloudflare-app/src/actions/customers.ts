'use server';

import { createCustomer, deleteCustomers, getCustomers } from "@/services/customers";
import { revalidatePath } from "next/cache";

export async function createCustomerActions(company: string, contact: string) {
    if (!company || !contact) throw new Error("不正な投稿です");
    if (company.trim().length > 200 || contact.trim().length > 200) throw new Error("不正な投稿です");
    await createCustomer(company, contact);
    revalidatePath("/");
}

export async function getCustomersActions() {
    const customers = await getCustomers();
    return customers.results;
}

export async function deleteCustomersActions() {
    await deleteCustomers();
    revalidatePath("/");
}
