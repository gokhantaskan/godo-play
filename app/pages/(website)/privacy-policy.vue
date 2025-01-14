<script setup lang="ts">
definePageMeta({
  name: "PrivacyPolicyPage",
});

useHead({
  title: "Privacy Policy",
  meta: [
    {
      name: "description",
      content:
        "Privacy Policy for GodoPlay - Learn how we collect, use, and protect your information.",
    },
  ],
});
</script>

<template>
  <main
    class="tw:py-8"
    role="main"
  >
    <div class="tw:container">
      <article class="prose">
        <header>
          <h1>Privacy Policy</h1>
          <time
            datetime="2025-01-13"
            class="tw:text-sm tw:text-gray-600"
          >
            Effective Date: January 13, 2025
          </time>
        </header>

        <section aria-labelledby="introduction">
          <h2 id="introduction">1. Introduction</h2>
          <p>
            GodoPlay ("us", "we", or "our") operates the website
            https://godo-play.com (the "Service"). We are committed to
            protecting your privacy. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you
            visit our website. By using our site, you consent to the practices
            described in this policy.
          </p>
        </section>

        <section aria-labelledby="information-collection">
          <h2 id="information-collection">2. Information We Collect</h2>
          <p>
            We may automatically collect certain information when you visit our
            website, including:
          </p>
          <ul>
            <li>
              <strong>Non-Personal Information:</strong> This includes data that
              does not directly identify you, such as your IP address, browser
              type, operating system, referring URLs, and pages visited on our
              site. We do not knowingly collect personally identifiable
              information (PII) from users.
            </li>
            <li>
              <strong>Cookies and Tracking Technologies:</strong> We use cookies
              and similar tracking technologies to enhance your experience on
              our site. Cookies are small files stored on your device that help
              us analyze web traffic and improve our services. We may use
              session cookies (which expire when you close your browser) and
              persistent cookies (which remain on your device for a set period).
              You can manage cookie preferences through your browser settings.
            </li>
          </ul>
        </section>

        <section aria-labelledby="information-use">
          <h2 id="information-use">3. How We Use Your Information</h2>
          <p>
            We use the information we collect for various purposes, including:
          </p>
          <ul>
            <li>
              To analyze website traffic and usage patterns through web
              analytics tools.
            </li>
            <li>To improve our website's functionality and user experience.</li>
            <li>
              To display relevant advertisements through our advertising
              partners.
            </li>
            <li>
              To integrate with third-party APIs that provide cross-platform
              gaming information.
            </li>
          </ul>
        </section>

        <section aria-labelledby="information-sharing">
          <h2 id="information-sharing">4. Sharing Your Information</h2>
          <p>We may share your information in the following situations:</p>
          <ul>
            <li>
              <strong>With Service Providers:</strong> We may employ third-party
              companies to facilitate our services (e.g., analytics providers,
              gaming platform APIs) who may have access to your non-personal
              data.
            </li>
            <li>
              <strong>For Legal Reasons:</strong> We may disclose your
              information if required by law or in response to valid requests by
              public authorities.
            </li>
            <li>
              <strong>External Links & Embedded Content:</strong> Our Service
              may include links to external websites or embedded content. We do
              not control and are not responsible for the privacy practices of
              these external sites or services. We encourage you to review their
              privacy policies before providing any personal information.
            </li>
          </ul>
        </section>

        <section aria-labelledby="data-security">
          <h2 id="data-security">5. Data Security</h2>
          <p>
            We take reasonable measures to protect your non-personal information
            from unauthorized access and breaches. However, no method of
            transmission over the internet or method of electronic storage is
            completely secure.
          </p>
        </section>

        <section aria-labelledby="childrens-privacy">
          <h2 id="childrens-privacy">6. Children's Privacy</h2>
          <p>
            Our Service is not directed to children under 13. We do not
            knowingly collect personal information from children. If you become
            aware that a child under this age has provided us with personal
            data, please contact us immediately so we can take appropriate
            action to delete such data.
          </p>
        </section>

        <section aria-labelledby="user-rights">
          <h2 id="user-rights">7. User Rights</h2>
          <p>
            As a user of our website, you have certain rights regarding your
            non-personal data (when applicable):
          </p>
          <ul>
            <li>
              Access: You have the right to request access to the non-personal
              data we hold about you.
            </li>
            <li>
              Correction: You have the right to request correction of any
              inaccurate or incomplete data.
            </li>
            <li>
              Deletion: You have the right to request deletion of any
              non-personal data we hold about you.
            </li>
          </ul>
          <p>
            To exercise these rights or if you have any questions about your
            data, please contact us at contact@godo-play.com.
          </p>
        </section>

        <section aria-labelledby="data-retention">
          <h2 id="data-retention">8. Data Retention</h2>
          <p>
            We retain any non-personal data collected by our analytics and
            tracking tools for as long as necessary for the purposes outlined in
            this Policy or as otherwise required by law.
          </p>
        </section>

        <section aria-labelledby="changes-to-privacy-policy">
          <h2 id="changes-to-privacy-policy">
            9. Changes to This Privacy Policy
          </h2>
          <p>
            We may update our Privacy Policy from time to time. Any changes will
            be posted on this page with an updated effective date. By continuing
            to use our Service after any changes become effective, you agree to
            the revised Privacy Policy.
          </p>
        </section>

        <footer>
          <section aria-labelledby="contact">
            <h2 id="contact">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us:
            </p>
            <address>
              <ul>
                <li>
                  Email:
                  <a href="mailto:contact@godo-play.com"
                    >contact@godo-play.com</a
                  >
                </li>
              </ul>
            </address>
          </section>
        </footer>
      </article>
    </div>
  </main>
</template>
