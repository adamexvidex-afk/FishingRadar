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

interface CatchMilestoneEmailProps {
  siteName: string
  siteUrl: string
  username?: string
  milestone: number
  totalCatches: number
  topSpecies?: string
}

export const CatchMilestoneEmail = ({
  siteName,
  siteUrl,
  username,
  milestone,
  totalCatches,
  topSpecies,
}: CatchMilestoneEmailProps) => {
  const milestoneEmoji = milestone >= 100 ? '🏆' : milestone >= 50 ? '🥇' : milestone >= 25 ? '🥈' : '🎉'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You hit {milestone} catches on {siteName}! {milestoneEmoji}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{milestoneEmoji} {milestone} Catches!</Heading>
          <Text style={text}>
            {username ? `Hey ${username},` : 'Hey angler,'} you just logged your{' '}
            <strong>{milestone}th catch</strong> on <strong>{siteName}</strong>!
          </Text>

          <div style={milestoneBox}>
            <Text style={milestoneNumber}>{totalCatches}</Text>
            <Text style={milestoneLabel}>Total Catches</Text>
            {topSpecies && (
              <Text style={milestoneDetail}>Most caught: {topSpecies}</Text>
            )}
          </div>

          <Text style={text}>
            {milestone >= 100
              ? "You're a true fishing legend! Very few anglers reach this level."
              : milestone >= 50
              ? "You're on fire! Half a century of catches — that's impressive."
              : milestone >= 25
              ? "Quarter century! You're building an awesome fishing record."
              : "Great start! Keep logging your catches to track your progress."}
          </Text>

          <Hr style={hr} />

          <Button style={button} href={`${siteUrl}/catch-log`}>
            View Your Catches
          </Button>

          <Text style={footer}>
            Keep casting — the next milestone is waiting! 🎣
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default CatchMilestoneEmail

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
const milestoneBox = {
  backgroundColor: '#f0f7ff',
  borderRadius: '16px',
  padding: '24px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}
const milestoneNumber = {
  fontSize: '48px',
  fontWeight: 'bold' as const,
  color: '#1a7fd4',
  margin: '0',
  lineHeight: '1',
}
const milestoneLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '4px 0 0',
}
const milestoneDetail = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '8px 0 0',
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
