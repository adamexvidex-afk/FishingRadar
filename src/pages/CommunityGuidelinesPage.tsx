const CommunityGuidelinesPage = () => {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl mb-8">
        Community Guidelines
      </h1>

      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        FishingRadar is a community built for anglers who want to share their fishing experiences, discover new spots, and connect with other fishing enthusiasts. To keep the platform safe and enjoyable for everyone, users must follow these guidelines.
      </p>

      <div className="space-y-8 text-foreground/90 leading-relaxed">
        {/* Respect */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">Respect Other Anglers</h2>
          <p className="text-sm text-muted-foreground">
            Users must treat others with respect. Harassment, hate speech, threats, or abusive behavior are not allowed.
          </p>
        </section>

        {/* Content */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">Appropriate Content</h2>
          <p className="text-sm text-muted-foreground mb-2">Users may share:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Fishing catches</li>
            <li>Fishing locations</li>
            <li>Fishing tips</li>
            <li>Photos related to fishing</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4 mb-2">The following content is not allowed:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Illegal activities</li>
            <li>Violent or harmful content</li>
            <li>Explicit or adult content</li>
            <li>Spam or advertising</li>
            <li>Misleading or fake fishing catches</li>
          </ul>
        </section>

        {/* Ethics */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">Fishing Ethics</h2>
          <p className="text-sm text-muted-foreground mb-2">FishingRadar encourages responsible fishing practices. Users should:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Follow local fishing regulations</li>
            <li>Respect catch limits and protected species</li>
            <li>Avoid sharing illegal fishing activities</li>
          </ul>
        </section>

        {/* Reporting */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">Reporting Violations</h2>
          <p className="text-sm text-muted-foreground">
            If you see content that violates these guidelines, you can report it within the app or contact us at{" "}
            <a href="mailto:fishing-radar-help@utiliora.com" className="text-primary hover:underline">fishing-radar-help@utiliora.com</a>.
            We may remove content or suspend accounts that violate these rules.
          </p>
        </section>

        {/* Data Deletion */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">Data Deletion Policy</h2>
          <p className="text-sm text-muted-foreground mb-4">FishingRadar respects users' rights to control their personal data.</p>

          <h3 className="font-semibold text-sm text-foreground mb-2">Account Deletion</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Users can delete their accounts directly within the application settings. Deleting an account will permanently remove:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Profile information</li>
            <li>Catch logs</li>
            <li>Uploaded photos</li>
            <li>Fishing analytics data</li>
            <li>Community posts</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">Once deleted, this information cannot be recovered.</p>

          <h3 className="font-semibold text-sm text-foreground mt-4 mb-2">Data Retention</h3>
          <p className="text-sm text-muted-foreground mb-2">Some data may be retained temporarily for:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Legal obligations</li>
            <li>Security purposes</li>
            <li>Fraud prevention</li>
          </ul>

          <h3 className="font-semibold text-sm text-foreground mt-4 mb-2">Requesting Data Deletion</h3>
          <p className="text-sm text-muted-foreground">
            If you cannot delete your account through the app, you can request deletion by contacting us at{" "}
            <a href="mailto:fishing-radar-help@utiliora.com" className="text-primary hover:underline">fishing-radar-help@utiliora.com</a>.
            We will process deletion requests within a reasonable timeframe.
          </p>
        </section>

        {/* Subscription */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">Subscription Terms</h2>
          <p className="text-sm text-muted-foreground mb-4">FishingRadar offers optional premium features through paid subscriptions.</p>

          <h3 className="font-semibold text-sm text-foreground mb-2">Premium Features</h3>
          <p className="text-sm text-muted-foreground mb-2">Premium may include:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Advanced fishing analytics</li>
            <li>AI fishing assistant features</li>
            <li>Fishing forecasts and predictions</li>
            <li>Fishing hotspots data</li>
            <li>Additional catch insights</li>
          </ul>

          <h3 className="font-semibold text-sm text-foreground mt-4 mb-2">Billing</h3>
          <p className="text-sm text-muted-foreground">
            Subscriptions may be billed monthly or annually. Payment is processed through the platform where the app was downloaded (Apple App Store or Google Play).
          </p>

          <h3 className="font-semibold text-sm text-foreground mt-4 mb-2">Auto-Renewal</h3>
          <p className="text-sm text-muted-foreground">
            Subscriptions automatically renew unless cancelled before the renewal date. Users can manage or cancel their subscription through their App Store or Google Play account settings.
          </p>

          <h3 className="font-semibold text-sm text-foreground mt-4 mb-2">Refunds</h3>
          <p className="text-sm text-muted-foreground">
            Refund requests are handled according to Apple App Store or Google Play refund policies. FishingRadar cannot directly process subscription refunds.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">Contact Information</h2>
          <p className="text-sm text-muted-foreground mb-2">If you have questions regarding privacy, legal policies, subscriptions, or community rules, please contact us:</p>
          <p className="text-sm text-muted-foreground">
            <a href="mailto:fishing-radar-help@utiliora.com" className="text-primary hover:underline">fishing-radar-help@utiliora.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default CommunityGuidelinesPage;
