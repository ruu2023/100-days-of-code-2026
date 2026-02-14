'use client';
import { createCustomerActions } from '@/actions/customers';

const Client = () => {
  return (
    <div>
      <form action={createCustomerActions}>
        <input type="text" name="company" />
        <input type="text" name="contact" />
        <button type="submit">Create</button>
      </form>
    </div>
  )
}

export default Client