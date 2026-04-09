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

interface WeeklyDigestEmailProps {
  siteName: string
  siteUrl: string
  username?: string
  catchCount?: number
  topSpecies?: string
  leaderboardRank?: number
  totalAnglers?: number
  weekHighlight?: string
}

export const WeeklyDigestEmail = ({
  siteName,
  siteUrl,
  username,
  catchCount = 0,
  topSpecies,
  leaderboardRank,
  totalAnglers,
  weekHighlight,
}: WeeklyDigestEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your weekly fishing recap from {siteName} 📊</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your Week in Fishing 📊</Heading>
        <Text style={text}>
          {username ? `Hey ${username},` : 'Hey angler,'} here's your weekly recap from{' '}
          <strong>{siteName}</strong>!
        </Text>

        <div style={statsBox}>
          <div style={statRow}>
            <Text style={statLabel}>🐟 Catches this week</Text>
            <Text style={statValue}>{catchCount}</Text>
          </div>
          {topSpecies && (
            <div style={statRow}>
              <Text style={statLabel}>🏆 Top species</Text>
              <Text style={statValue}>{topSpecies}</Text>
            </div>
          )}
          {leaderboardRank && totalAnglers && (
            <div style={statRow}>
              <Text style={statLabel}>📈 Leaderboard</Text>
              <Text style={statValue}>#{leaderboardRank} of {totalAnglers}</Text>
            </div>
          )}
        </div>

        {weekHighlight && (
          <>
            <Hr style={hr} />
            <Text style={text}>
              <strong>🌟 Week highlight:</strong> {weekHighlight}
            </Text>
          </>
        )}

        <Hr style={hr} />

        <Button style={button} href={siteUrl}>
          View Full Stats
        </Button>

        <Text style={footer}>
          Keep casting — next week could be your best yet! 🎣
        </Text>
      </Container>
    </Body>
  </Html>
)

export default WeeklyDigestEmail

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
const statsBox = {
  backgroundColor: '#f0f7ff',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 20px',
}
const statRow = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
  marginBottom: '8px',
}
const statLabel = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0',
}
const statValue = {
  fontSize: '14px',
  fontWeight: 'bold' as const,
  color: '#1b2540',
  margin: '0',
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
