/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Button,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface PremiumWelcomeEmailProps {
  siteName: string
  siteUrl: string
  username?: string
}

export const PremiumWelcomeEmail = ({
  siteName,
  siteUrl,
  username,
}: PremiumWelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {siteName} Premium! 🎣👑</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're Premium now! 👑</Heading>
        <Text style={text}>
          {username ? `Hey ${username},` : 'Hey angler,'} thanks for upgrading to{' '}
          <strong>{siteName} Premium</strong>! Here's what you've unlocked:
        </Text>

        <div style={featureList}>
          <Text style={feature}>🌊 <strong>Fishing Conditions</strong> — Real-time water temp, flow & smart recommendations</Text>
          <Text style={feature}>📍 <strong>Fishing Hotspots</strong> — 1,000+ premium locations with species details</Text>
          <Text style={feature}>🧠 <strong>CastMate AI</strong> — Unlimited conversations with your personal fishing guide</Text>
          <Text style={feature}>📊 <strong>Advanced Statistics</strong> — Deep insights, trends & catch analytics</Text>
          <Text style={feature}>🌤️ <strong>7-Day Fishing Forecast</strong> — Weather-based predictions & best day picks</Text>
          <Text style={feature}>📈 <strong>Catch Trends & Graphs</strong> — Monthly comparisons & personal records</Text>
          <Text style={feature}>📥 <strong>Offline Fish Catalog</strong> — 1,000+ fish species, no internet needed</Text>
        </div>

        <Hr style={hr} />

        <Button style={button} href={siteUrl}>
          Start Exploring
        </Button>

        <Text style={footer}>
          Tight lines and happy fishing! 🎣
        </Text>
      </Container>
    </Body>
  </Html>
)

export default PremiumWelcomeEmail

const main = { backgroundColor: '#f8f9fb', fontFamily: "'DM Sans', 'Outfit', Arial, sans-serif" }
const container = { backgroundColor: '#ffffff', padding: '32px 28px', borderRadius: '16px', margin: '40px auto', maxWidth: '480px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  fontFamily: "'Outfit', 'DM Sans', Arial, sans-serif",
  color: '#1b2540',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const featureList = { margin: '0 0 20px' }
const feature = {
  fontSize: '13px',
  color: '#374151',
  lineHeight: '1.5',
  margin: '0 0 8px',
  paddingLeft: '4px',
}
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const button = {
  backgroundColor: '#1a7fd4',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  borderRadius: '16px',
  padding: '14px 28px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#94a3b8', margin: '24px 0 0' }
