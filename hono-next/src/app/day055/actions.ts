"use server";

import { sign } from "hono/jwt";

export async function generateJwtAction(payloadJson: string, secret: string) {
  try {
    const payload = JSON.parse(payloadJson);
    
    // Ensure exp is a number if it exists
    if (payload.exp && typeof payload.exp === 'string') {
      const parsedExp = parseInt(payload.exp, 10);
      if (!isNaN(parsedExp)) {
        payload.exp = parsedExp;
      }
    }

    const token = await sign(payload, secret);
    return { success: true, token };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to generate JWT" };
  }
}
