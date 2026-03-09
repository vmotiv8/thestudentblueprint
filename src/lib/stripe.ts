import Stripe from 'stripe'
import { getStripeSecretKey } from './env'

export const stripe = new Stripe(getStripeSecretKey(), {
  apiVersion: '2025-12-15.clover'
})

export const ASSESSMENT_PRICE = 49900 // $499 in cents
export const ASSESSMENT_PRICE_DISPLAY = '$499'