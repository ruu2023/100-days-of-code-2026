import { redirect } from 'next/navigation'
import Link from 'next/link'
import React from 'react'

const Page = () => {
  return redirect("/login");
}

export default Page