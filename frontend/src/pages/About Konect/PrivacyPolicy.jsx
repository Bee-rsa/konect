import React from 'react';

const Policy = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full flex flex-col items-center bg-gray-100">
      <div className="container mx-auto px-4 py-12 mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Table of Contents */}
        <nav className="md:col-span-1 sticky top-16 h-auto shadow-lg rounded-lg p-4 max-h-screen overflow-y-auto border-2 bg-gray-200 border-custom-blue font-poppins">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 pb-2">Table of Contents</h2>
          <ul className="space-y-2">
            <li><a href="#information" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">1. Information We Collect</a></li>
            <li><a href="#usage" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">2. How We Use Information</a></li>
            <li><a href="#legal-basis" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">3. Legal Basis for Processing</a></li>
            <li><a href="#disclosure" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">4. Information Disclosure</a></li>
            <li><a href="#international" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">5. International Transfers</a></li>
            <li><a href="#security" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">6. Data Security</a></li>
            <li><a href="#retention" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">7. Data Retention</a></li>
            <li><a href="#rights" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">8. Your Rights</a></li>
            <li><a href="#cookies" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">9. Cookies &amp; Tracking</a></li>
            <li><a href="#third-party" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">10. Third-Party Services</a></li>
            <li><a href="#sensitive-data" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">11. No Sensitive Data Collection</a></li>
            <li><a href="#children" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">12. Children&apos;s Privacy</a></li>
            <li><a href="#changes" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">13. Policy Changes</a></li>
            <li><a href="#contact" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">14. Contact Us</a></li>
          </ul>
        </nav>

        {/* Main Content */}
        <div className="md:col-span-2 max-h-screen overflow-y-auto pr-4">
          <h1 className="text-3xl font-bold mb-6 font-poppins">Privacy Policy for Cargo Konect</h1>
          <p className="mb-4"><strong>Effective Date:</strong> 28th April 2026</p>

          <p className="mb-4">
            Cargo Konect (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to
            protecting personal information in accordance with applicable data protection laws, including the Protection
            of Personal Information Act, 2013 (&quot;POPIA&quot;), where applicable.
          </p>

          <p className="mb-4">
            This Privacy Policy explains how Cargo Konect collects, uses, stores, shares, and protects personal
            information when you access or use our platform, website, analytics tools, case studies, reports, and
            related services. Cargo Konect is a maritime and terminal analytics platform. We do not provide freight,
            booking, payment, or logistics fulfilment services.
          </p>

          <h2 id="information" className="text-2xl font-bold mb-4 mt-8 font-poppins">1. Information We Collect</h2>
          <p className="mb-4">
            We collect limited personal information necessary to operate, secure, and improve the Platform. This may
            include:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Identity Data:</strong> Name, company name, or username where provided by you</li>
            <li><strong>Contact Data:</strong> Email address and optional contact details you submit to us</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system, and login-related data</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, analytics interactions, and general platform activity</li>
            <li><strong>Communications Data:</strong> Information you provide when contacting us, submitting forms, or requesting support</li>
          </ul>
          <p className="mb-4">
            Cargo Konect does not intentionally collect financial information, payment card details, biometric data,
            government-issued identification numbers, or special personal information through the Platform.
          </p>

          <h2 id="usage" className="text-2xl font-bold mb-4 mt-8 font-poppins">2. How We Use Information</h2>
          <p className="mb-4">
            We use personal information only where necessary for legitimate business and platform-related purposes,
            including to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>provide, maintain, and improve the Platform;</li>
            <li>manage accounts and respond to user enquiries;</li>
            <li>monitor usage, performance, and user experience;</li>
            <li>enhance platform security and prevent misuse;</li>
            <li>communicate important notices, service updates, or policy changes;</li>
            <li>send marketing or product updates where you have consented or where otherwise permitted by law.</li>
          </ul>
          <p className="mb-4">
            We do not use personal information for freight operations, logistics fulfilment, shipment execution,
            brokerage, payment processing, or transport services.
          </p>

          <h2 id="legal-basis" className="text-2xl font-bold mb-4 mt-8 font-poppins">3. Legal Basis for Processing</h2>
          <p className="mb-4">
            Where required by law, we rely on one or more of the following legal grounds for processing personal
            information:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Legitimate Interest:</strong> to operate, secure, improve, and administer the Platform;</li>
            <li><strong>Consent:</strong> where you choose to provide information or opt in to certain communications;</li>
            <li><strong>Legal Obligation:</strong> where processing is necessary to comply with applicable law, regulation, or lawful request.</li>
          </ul>

          <h2 id="disclosure" className="text-2xl font-bold mb-4 mt-8 font-poppins">4. Information Disclosure</h2>
          <p className="mb-4">
            We may disclose limited personal information only where necessary to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>service providers that support platform hosting, infrastructure, analytics, communications, or security;</li>
            <li>professional advisers such as legal, compliance, or audit advisers where necessary;</li>
            <li>regulatory, law enforcement, or governmental authorities where required by law or lawful process;</li>
            <li>a purchaser, successor, or transferee in connection with a merger, sale, restructuring, or transfer of business assets, subject to appropriate safeguards.</li>
          </ul>
          <p className="mb-4">
            Cargo Konect does not sell personal information and does not share personal information with logistics
            operators, carriers, terminal operators, or freight service providers for shipment-related purposes.
          </p>

          <h2 id="international" className="text-2xl font-bold mb-4 mt-8 font-poppins">5. International Transfers</h2>
          <p className="mb-4">
            Some service providers or systems used by Cargo Konect may store or process information outside South
            Africa. Where cross-border transfers occur, we take reasonable steps to ensure that appropriate safeguards
            are in place and that personal information receives an adequate level of protection consistent with
            applicable law.
          </p>

          <h2 id="security" className="text-2xl font-bold mb-4 mt-8 font-poppins">6. Data Security</h2>
          <p className="mb-4">
            Cargo Konect implements reasonable technical and organisational measures designed to protect personal
            information against loss, misuse, unauthorised access, disclosure, alteration, or destruction.
          </p>
          <p className="mb-4">
            However, no platform, network, or method of electronic storage or transmission is completely secure, and we
            cannot guarantee absolute security. Users are responsible for maintaining the confidentiality of their own
            account credentials and devices.
          </p>

          <h2 id="retention" className="text-2xl font-bold mb-4 mt-8 font-poppins">7. Data Retention</h2>
          <p className="mb-4">
            We retain personal information only for as long as reasonably necessary to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>maintain user accounts and provide platform functionality;</li>
            <li>respond to support requests and manage platform relationships;</li>
            <li>comply with legal, regulatory, or operational obligations;</li>
            <li>resolve disputes, enforce our policies, or protect legal rights.</li>
          </ul>
          <p className="mb-4">
            When personal information is no longer needed, we will delete, anonymise, or securely dispose of it,
            subject to any retention obligations imposed by law.
          </p>

          <h2 id="rights" className="text-2xl font-bold mb-4 mt-8 font-poppins">8. Your Rights</h2>
          <p className="mb-4">
            Subject to applicable law, including POPIA where applicable, you may have the right to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>request access to personal information we hold about you;</li>
            <li>request correction or update of inaccurate or incomplete information;</li>
            <li>object to certain processing activities;</li>
            <li>request deletion of personal information, subject to legal limitations;</li>
            <li>withdraw consent where processing is based on consent;</li>
            <li>lodge a complaint with the relevant data protection regulator or authority.</li>
          </ul>
          <p className="mb-4">
            To exercise any of these rights, please contact us using the details listed below.
          </p>

          <h2 id="cookies" className="text-2xl font-bold mb-4 mt-8 font-poppins">9. Cookies &amp; Tracking</h2>
          <p className="mb-4">
            Cargo Konect may use cookies and similar technologies to support website functionality, improve user
            experience, understand usage patterns, and analyse platform performance.
          </p>
          <p className="mb-4">
            These technologies may collect limited technical and usage information such as browser type, session
            activity, referring pages, and interaction behaviour. We use cookies primarily for platform functionality
            and analytics. We do not intentionally use cookies to collect sensitive personal information.
          </p>
          <p className="mb-4">
            You can manage cookie preferences through your browser settings, although disabling certain cookies may
            affect platform functionality.
          </p>

          <h2 id="third-party" className="text-2xl font-bold mb-4 mt-8 font-poppins">10. Third-Party Services</h2>
          <p className="mb-4">
            Cargo Konect may use third-party services that support the operation of the Platform, such as:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>hosting and infrastructure providers;</li>
            <li>analytics tools;</li>
            <li>communication or email service providers;</li>
            <li>security or monitoring tools.</li>
          </ul>
          <p className="mb-4">
            These third parties may process limited personal or technical data only as necessary to provide their
            services to us. Their use of information may also be governed by their own privacy policies and contractual
            obligations.
          </p>

          <h2 id="sensitive-data" className="text-2xl font-bold mb-4 mt-8 font-poppins">11. No Sensitive Data Collection</h2>
          <p className="mb-4">
            Cargo Konect does not intentionally collect or request:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>financial or payment information;</li>
            <li>government-issued identification numbers;</li>
            <li>biometric data;</li>
            <li>special personal information or other sensitive personal data as defined by applicable law.</li>
          </ul>
          <p className="mb-4">
            Users should not submit such information through the Platform. If sensitive personal information is provided
            to us unintentionally, we reserve the right to delete it where appropriate and subject to legal
            requirements.
          </p>

          <h2 id="children" className="text-2xl font-bold mb-4 mt-8 font-poppins">12. Children&apos;s Privacy</h2>
          <p className="mb-4">
            The Platform is not intended for children under the age of 18. We do not knowingly collect personal
            information from children. If we become aware that personal information from a child has been submitted
            without appropriate authorisation, we will take reasonable steps to delete it.
          </p>

          <h2 id="changes" className="text-2xl font-bold mb-4 mt-8 font-poppins">13. Policy Changes</h2>
          <p className="mb-4">
            Cargo Konect may update this Privacy Policy from time to time to reflect changes in our services, legal
            requirements, or privacy practices. Any updated version will be posted on this page with a revised
            effective date.
          </p>
          <p className="mb-4">
            Your continued use of the Platform after any changes become effective constitutes your acknowledgement of
            the updated Privacy Policy.
          </p>

          <h2 id="contact" className="text-2xl font-bold mb-4 mt-8 font-poppins">14. Contact Us</h2>
          <p className="mb-4">
            If you have any questions, requests, or concerns regarding this Privacy Policy or the handling of your
            personal information, please contact Cargo Konect at:
          </p>
          <p className="mb-4">
            <strong>Information Officer / Contact Person:</strong> Brendan Cleaver<br />
            <strong>Email:</strong> info@cargokonect.com<br />
            <strong>Phone:</strong> [Insert Contact Number]<br />
            <strong>Address:</strong> [Insert Registered or Business Address]
          </p>
        </div>
      </div>
    </div>
  );
};

export default Policy;