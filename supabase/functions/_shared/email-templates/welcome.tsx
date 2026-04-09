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

interface WelcomeEmailProps {
  siteName: string
  siteUrl: string
  username?: string
}

export const WelcomeEmail = ({
  siteName,
  siteUrl,
  username,
}: WelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {siteName}! Let's catch some fish 🎣</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome aboard! 🎣</Heading>
        <Text style={text}>
          {username ? `Hey ${username},` : 'Hey angler,'} welcome to{' '}
          <strong>{siteName}</strong>! You're all set to start your fishing journey.
        </Text>

        <Text style={text}>Here's what you can do right away:</Text>

        <div style={featureList}>
          <Text style={feature}>📝 <strong>Log your catches</strong> — Track every fish with photos, weight & details</Text>
          <Text style={feature}>🐟 <strong>Explore the fish catalog</strong> — 1,000+ species with tips & techniques</Text>
          <Text style={feature}>👥 <strong>Join the community</strong> — Share catches, chat with fellow anglers</Text>
          <Text style={feature}>📊 <strong>Track your stats</strong> — Watch your fishing progress grow</Text>
        </div>

        <Hr style={hr} />

        <Button style={button} href={siteUrl}>
          Start Fishing
        </Button>

        <Text style={footer}>
          Tight lines and welcome to the crew! 🎣
        </Text>
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail

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
