import { NextResponse } from 'next/server'
import { BILLING_PLANS } from '@/lib/billing-plans'

export async function GET() {
  return NextResponse.json({ plans: BILLING_PLANS })
}
