'use server';

import { createCustomer } from "@/services/customers";
import { revalidatePath } from "next/cache";

export async function createCustomerActions(formData: FormData) {
    const company = formData.get("company");
    const contact = formData.get("contact");
    await createCustomer(company as string, contact as string);
    revalidatePath("/");
}