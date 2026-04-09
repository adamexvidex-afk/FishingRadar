const PrivacyPage = () => {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-muted-foreground mb-8">FishingRadar — Last updated: March 2026</p>

      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        FishingRadar respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use the FishingRadar mobile application and related services.
      </p>

      <div className="space-y-8 text-foreground/90 leading-relaxed">
        {/* 1 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">1. Information We Collect</h2>

          <h3 className="font-semibold text-sm text-foreground mt-4 mb-2">Personal Information</h3>
          <p className="text-sm text-muted-foreground mb-2">When you create an account or use the app, we may collect:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Name or username</li>
            <li>Email address</li>
            <li>Profile photo</li>
            <li>Account credentials</li>
          </ul>

          <h3 className="font-semibold text-sm text-foreground mt-4 mb-2">Fishing Activity Data</h3>
          <p className="text-sm text-muted-foreground mb-2">When using the app, we may collect:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Catch logs (species, size, weight, bait, location)</li>
            <li>Photos uploaded by users</li>
            <li>Fishing locations entered by the user</li>
            <li>Analytics about fishing activity</li>
          </ul>

          <h3 className="font-semibold text-sm text-foreground mt-4 mb-2">Location Data</h3>
          <p className="text-sm text-muted-foreground mb-2">FishingRadar may collect location data if you enable location services in order to:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Show nearby fishing hotspots</li>
            <li>Provide fishing conditions</li>
            <li>Display relevant fishing forecasts</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">Location data is only used while the app is in use unless otherwise permitted.</p>

          <h3 className="font-semibold text-sm text-foreground mt-4 mb-2">Device Information</h3>
          <p className="text-sm text-muted-foreground mb-2">We may automatically collect:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Device type</li>
            <li>Operating system</li>
            <li>App usage statistics</li>
            <li>Crash reports</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">This helps us improve app performance and reliability.</p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">2. How We Use Your Information</h2>
          <p className="text-sm text-muted-foreground mb-2">We use the collected data to:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Provide fishing forecasts and real-time conditions</li>
            <li>Analyze catch trends and statistics</li>
            <li>Display fishing hotspots and maps</li>
            <li>Allow users to share catches with the community</li>
            <li>Improve AI fishing recommendations</li>
            <li>Maintain and improve app functionality</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3 font-medium">We do not sell your personal data to third parties.</p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">3. Sharing Information</h2>

          <h3 className="font-semibold text-sm text-foreground mt-4 mb-2">Community Features</h3>
          <p className="text-sm text-muted-foreground">
            Information such as catch posts, usernames, and shared photos may be visible to other users if posted publicly.
          </p>

          <h3 className="font-semibold text-sm text-foreground mt-4 mb-2">Service Providers</h3>
          <p className="text-sm text-muted-foreground mb-2">We may use third-party services for:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Cloud storage</li>
            <li>Analytics</li>
            <li>Authentication</li>
            <li>Map services</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">These providers only process data necessary for their services.</p>

          <h3 className="font-semibold text-sm text-foreground mt-4 mb-2">Legal Requirements</h3>
          <p className="text-sm text-muted-foreground">
            We may disclose data if required by law or to protect our legal rights.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">4. Data Storage and Security</h2>
          <p className="text-sm text-muted-foreground">
            We take reasonable security measures to protect your personal information from unauthorized access or misuse.
            However, no internet transmission or storage system is completely secure.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">5. Your Rights</h2>
          <p className="text-sm text-muted-foreground mb-2">Depending on your location, you may have the right to:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            You can request deletion by contacting us at:{" "}
            <a href="mailto:fishing-radar-help@utiliora.com" className="text-primary hover:underline">
              fishing-radar-help@utiliora.com
            </a>
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">6. Children's Privacy</h2>
          <p className="text-sm text-muted-foreground">
            FishingRadar is not intended for children under the age of 13. We do not knowingly collect personal information from children.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">7. Changes to This Privacy Policy</h2>
          <p className="text-sm text-muted-foreground">
            We may update this Privacy Policy from time to time. Changes will be posted within the application or on our website.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-3">8. Contact Us</h2>
          <p className="text-sm text-muted-foreground">
            If you have any questions about this Privacy Policy, contact us:{" "}
            <a href="mailto:fishing-radar-help@utiliora.com" className="text-primary hover:underline">
              fishing-radar-help@utiliora.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
