import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { PremiumWelcomeEmail } from '../_shared/email-templates/premium-welcome.tsx'
import { WelcomeEmail } from '../_shared/email-templates/welcome.tsx'
import { WeeklyDigestEmail } from '../_shared/email-templates/weekly-digest.tsx'
import { CatchMilestoneEmail } from '../_shared/email-templates/catch-milestone.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SITE_NAME = 'fishingradar'
const SENDER_DOMAIN = 'notify.utiliora.com'
const FROM_DOMAIN = 'utiliora.com'
const SITE_URL = 'https://fishingradar.lovable.app'

// Template registry
const TEMPLATES: Record<string, {
  subject: string
  component: React.ComponentType<any>
}> = {
  'premium-welcome': {
    subject: 'Welcome to Premium! 👑',
    component: PremiumWelcomeEmail,
  },
  'welcome': {
    subject: 'Welcome to fishingradar! 🎣',
    component: WelcomeEmail,
  },
  'weekly-digest': {
    subject: 'Your Weekly Fishing Recap 📊',
    component: WeeklyDigestEmail,
  },
  'catch-milestone': {
    subject: 'You hit a new milestone! 🏆',
    component: CatchMilestoneEmail,
  },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Auth: validate the caller
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) throw new Error('Auth failed')

    const email = claimsData.claims.email as string
    const userId = claimsData.claims.sub as string
    if (!email) throw new Error('No email in token')

    const { template, props: extraProps } = await req.json()

    const tmpl = TEMPLATES[template]
    if (!tmpl) throw new Error(`Unknown template: ${template}`)

    // Check suppression list
    const { data: suppressed } = await supabaseAdmin
      .from('suppressed_emails')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (suppressed && suppressed.length > 0) {
      console.log('Email suppressed', { email, template })
      return new Response(JSON.stringify({ success: true, suppressed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch username from profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single()

    const templateProps = {
      siteName: SITE_NAME,
      siteUrl: SITE_URL,
      username: profile?.username || undefined,
      ...extraProps,
    }

    const html = await renderAsync(React.createElement(tmpl.component, templateProps))
    const text = await renderAsync(React.createElement(tmpl.component, templateProps), { plainText: true })

    const messageId = crypto.randomUUID()

    // Log pending
    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: template,
      recipient_email: email,
      status: 'pending',
    })

    // Enqueue to transactional queue
    const { error: enqueueError } = await supabaseAdmin.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: messageId,
        to: email,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject: tmpl.subject,
        html,
        text,
        purpose: 'transactional',
        label: template,
        queued_at: new Date().toISOString(),
      },
    })

    if (enqueueError) {
      console.error('Enqueue failed', enqueueError)
      await supabaseAdmin.from('email_send_log').insert({
        message_id: messageId,
        template_name: template,
        recipient_email: email,
        status: 'failed',
        error_message: 'Failed to enqueue',
      })
      throw new Error('Failed to enqueue email')
    }

    console.log('Transactional email enqueued', { template, email, messageId })

    return new Response(JSON.stringify({ success: true, queued: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('send-transactional-email error:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
