const LegalPage = () => {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl mb-2">
        Legal Information / Terms of Use
      </h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        These Terms of Use govern your access to and use of the FishingRadar mobile application. By using the app, you agree to these terms.
      </p>

      <div className="space-y-8 text-foreground/90 leading-relaxed">
        {/* 1 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">1. Use of the Application</h2>
          <p className="text-sm text-muted-foreground mb-2">FishingRadar provides tools for:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Fishing forecasts</li>
            <li>Catch tracking</li>
            <li>Fishing community interaction</li>
            <li>Fishing analytics</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">The information provided is for informational purposes only. Fishing success cannot be guaranteed.</p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">2. User Content</h2>
          <p className="text-sm text-muted-foreground mb-2">Users may upload content including:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Fishing photos</li>
            <li>Catch logs</li>
            <li>Comments or posts</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            You retain ownership of your content but grant FishingRadar permission to display and distribute it within the platform. Users are responsible for the content they post.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">3. Acceptable Use</h2>
          <p className="text-sm text-muted-foreground mb-2">Users may not:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Upload illegal or harmful content</li>
            <li>Impersonate other users</li>
            <li>Use the platform for spam or harassment</li>
            <li>Attempt to interfere with the app's functionality</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">Violation may result in account suspension.</p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">4. Intellectual Property</h2>
          <p className="text-sm text-muted-foreground mb-2">All content related to the FishingRadar platform including:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Branding</li>
            <li>Design</li>
            <li>Software</li>
            <li>Algorithms</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">is owned by FishingRadar and protected by copyright and intellectual property laws.</p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">5. Premium Subscription</h2>
          <p className="text-sm text-muted-foreground mb-2">Some features require a paid subscription. Subscription terms:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Billed monthly or annually</li>
            <li>Automatically renew unless cancelled</li>
            <li>Managed through the app store platform</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">Refunds are subject to App Store or Google Play policies.</p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">6. Limitation of Liability</h2>
          <p className="text-sm text-muted-foreground mb-2">FishingRadar is not responsible for:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Fishing outcomes</li>
            <li>Environmental conditions</li>
            <li>Errors in forecasts or predictions</li>
            <li>User-generated content</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">Use of the application is at your own risk.</p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">7. Termination</h2>
          <p className="text-sm text-muted-foreground">
            We may suspend or terminate accounts that violate these terms. Users may delete their accounts at any time.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">8. Governing Law</h2>
          <p className="text-sm text-muted-foreground">
            These terms are governed by applicable laws in the jurisdiction where the service operates.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">9. Contact</h2>
          <p className="text-sm text-muted-foreground">
            For legal questions contact:{" "}
            <a href="mailto:fishing-radar-help@utiliora.com" className="text-primary hover:underline">
              fishing-radar-help@utiliora.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default LegalPage;
