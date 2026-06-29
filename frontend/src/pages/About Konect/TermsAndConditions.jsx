import React from 'react';

const TermsAndConditions = () => {
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
            <li><a href="#definitions" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">1. Definitions</a></li>
            <li><a href="#acceptance" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">2. Acceptance of Terms</a></li>
            <li><a href="#eligibility" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">3. User Eligibility</a></li>
            <li><a href="#accounts" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">4. Account Registration and Security</a></li>
            <li><a href="#platform-use" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">5. Platform Use</a></li>
            <li><a href="#data-accuracy" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">6. Data Accuracy and No Warranty</a></li>
            <li><a href="#no-reliance" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">7. No Reliance / Use at Own Risk</a></li>
            <li><a href="#user-responsibilities" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">8. User Responsibilities</a></li>
            <li><a href="#acceptable-use" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">9. Acceptable Use Restrictions</a></li>
            <li><a href="#case-studies" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">10. Case Studies and Research Content</a></li>
            <li><a href="#intellectual-property" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">11. Intellectual Property</a></li>
            <li><a href="#third-party" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">12. Third-Party Sources and Links</a></li>
            <li><a href="#availability" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">13. Service Availability</a></li>
            <li><a href="#privacy" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">14. Data Protection and Privacy</a></li>
            <li><a href="#indemnity" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">15. Indemnity</a></li>
            <li><a href="#termination" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">16. Suspension and Termination</a></li>
            <li><a href="#liability" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">17. Limitation of Liability</a></li>
            <li><a href="#governing-law" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">18. Governing Law</a></li>
            <li><a href="#changes" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">19. Changes to Terms</a></li>
            <li><a href="#contact" className="text-black hover:no-underline hover:text-custom-blue transition duration-200 font-poppins">20. Contact Information</a></li>
          </ul>
        </nav>

        {/* Main Content */}
        <div className="md:col-span-2 max-h-screen bg-gray-100 overflow-y-auto pr-4">
          <h1 className="text-3xl font-bold mb-6 font-poppins">Terms and Conditions</h1>
          <p className="mb-4"><strong>Effective Date:</strong> 28th April 2026</p>

          <p className="mb-4">
            Welcome to Cargo Konect. By accessing or using our platform, website, analytics tools, case studies,
            reports, visualisations, and related content, you agree to comply with and be bound by these Terms and
            Conditions. These Terms govern your use of Cargo Konect and all content, functionality, and services made
            available through the platform. If you do not agree to these Terms, you must not use Cargo Konect.
          </p>

          <h2 id="definitions" className="text-2xl font-bold mb-4 font-poppins">1. Definitions</h2>
          <p className="mb-4">
            “Cargo Konect” refers to the digital platform operated under the Cargo Konect name, providing maritime,
            port, and terminal-related analytics, insights, research content, and supporting information.
          </p>
          <p className="mb-4">
            “Platform” refers to the Cargo Konect website, digital services, dashboards, analytics tools, terminal
            berthing information, case studies, reports, visual content, and all related features and materials.
          </p>
          <p className="mb-4">
            “User” refers to any individual, company, organisation, or entity that accesses or uses the Platform.
          </p>
          <p className="mb-4">
            “Content” includes all text, data, analytics, schedules, estimates, reports, graphics, visualisations,
            commentary, opinions, research, case studies, and other materials made available on the Platform.
          </p>

          <h2 id="acceptance" className="text-2xl font-bold mb-4 font-poppins">2. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using Cargo Konect, you confirm that you have read, understood, and agreed to these Terms
            and Conditions. If you do not agree, you must immediately stop using the Platform.
          </p>
          <p className="mb-4">
            By using the Platform, you acknowledge that Cargo Konect provides informational and analytical content only
            and does not provide operational, financial, legal, commercial, or logistical advice.
          </p>
          <p className="mb-4">
            Cargo Konect reserves the right to modify, amend, or update these Terms at any time. Continued use of the
            Platform after changes are published constitutes your acceptance of the revised Terms.
          </p>

          <h2 id="eligibility" className="text-2xl font-bold mb-4 font-poppins">3. User Eligibility</h2>
          <p className="mb-4">
            You must be at least 18 years old or otherwise have the legal capacity to enter into a binding agreement in
            order to use the Platform. If you are using Cargo Konect on behalf of a company or other legal entity, you
            represent that you have the authority to bind that entity to these Terms.
          </p>
          <p className="mb-4">
            You agree to use the Platform only in compliance with applicable laws, regulations, and industry standards.
          </p>

          <h2 id="accounts" className="text-2xl font-bold mb-4 font-poppins">4. Account Registration and Security</h2>
          <p className="mb-4">
            Certain features of the Platform may require registration. Where registration is required, you agree to
            provide accurate, complete, and current information and to keep that information updated.
          </p>
          <p className="mb-4">
            You are responsible for maintaining the confidentiality of your account credentials and for all activity
            conducted under your account. Cargo Konect reserves the right to suspend or terminate accounts where
            information is false, misleading, incomplete, or used in breach of these Terms.
          </p>
          <p className="mb-4">
            You must notify Cargo Konect immediately if you suspect any unauthorised use of your account or any breach
            of security.
          </p>

          <h2 id="platform-use" className="text-2xl font-bold mb-4 font-poppins">5. Platform Use</h2>
          <p className="mb-4">
            Cargo Konect provides access to maritime, port, and terminal-related data, analytics, research, and
            insights for informational purposes only.
          </p>
          <p className="mb-4">
            Cargo Konect does not provide shipping, freight forwarding, customs, warehousing, terminal operations,
            brokerage, transportation, booking, or transactional services. Cargo Konect is not a carrier, port
            authority, logistics operator, freight broker, or shipping agent.
          </p>
          <p className="mb-4">
            No content on the Platform creates a contractual relationship between Cargo Konect and any User in respect
            of vessel movement, cargo handling, berth access, terminal allocation, freight movement, shipment execution,
            or operational performance.
          </p>
          <p className="mb-4">
            Users acknowledge that the Platform is an informational tool only and must not be treated as an official
            source of port authority instruction, berth confirmation, legal notice, or commercial commitment.
          </p>

          <h2 id="data-accuracy" className="text-2xl font-bold mb-4 font-poppins">6. Data Accuracy and No Warranty</h2>
          <p className="mb-4">
            Cargo Konect aims to provide useful and relevant information, but we do not guarantee that any Content is
            accurate, complete, current, uninterrupted, error-free, or suitable for your intended purpose.
          </p>
          <p className="mb-4">
            Platform Content may include delays, omissions, estimation-based outputs, historical interpretations,
            forward-looking observations, incomplete information, third-party sourced information, or data that changes
            without notice.
          </p>
          <p className="mb-4">
            Cargo Konect makes no warranties or representations regarding vessel schedules, terminal availability,
            port-side activity, berth windows, operational conditions, turnaround times, congestion patterns, or any
            other live or inferred industry information.
          </p>
          <p className="mb-4">
            All information is provided on an “as is” and “as available” basis, without warranties of any kind, whether
            express or implied.
          </p>

          <h2 id="no-reliance" className="text-2xl font-bold mb-4 font-poppins">7. No Reliance / Use at Own Risk</h2>
          <p className="mb-4">
            Your use of the Platform and reliance on any Content is entirely at your own risk. You are solely
            responsible for independently verifying information before acting on it.
          </p>
          <p className="mb-4">
            Cargo Konect shall not be responsible for any decision, action, or omission made by you or any third party
            based on the Platform or its Content, including but not limited to operational planning, commercial
            decisions, scheduling, dispatching, cargo handling, negotiations, risk allocation, or business strategy.
          </p>
          <p className="mb-4">
            The Platform is not a substitute for official port authority publications, terminal operator notices, vessel
            agents, shipping line communications, contractual documents, legal advice, or specialist professional
            services.
          </p>

          <h2 id="user-responsibilities" className="text-2xl font-bold mb-4 font-poppins">8. User Responsibilities</h2>
          <p className="mb-4">
            You agree to use the Platform lawfully, responsibly, and in a manner that does not interfere with the
            operation, security, integrity, or reputation of Cargo Konect.
          </p>
          <p className="mb-4">
            You are responsible for ensuring that any interpretation, use, or implementation of Platform Content is
            appropriate for your circumstances and supported by independent review where required.
          </p>
          <p className="mb-4">
            Where you submit information to the Platform, you warrant that such information is accurate, lawful, and
            does not infringe the rights of any person or entity.
          </p>

          <h2 id="acceptable-use" className="text-2xl font-bold mb-4 font-poppins">9. Acceptable Use Restrictions</h2>
          <p className="mb-4">
            You may not use the Platform to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>scrape, copy, mine, extract, or harvest data at scale;</li>
            <li>reverse engineer, decompile, or attempt to replicate any part of the Platform;</li>
            <li>use bots, scripts, crawlers, or automated tools without written consent;</li>
            <li>reproduce, republish, sell, licence, or commercially exploit Platform Content without permission;</li>
            <li>misrepresent Cargo Konect Content as official port, terminal, government, or shipping line data;</li>
            <li>upload or transmit harmful code, malware, or malicious material;</li>
            <li>use the Platform in any way that could damage, disable, overburden, or impair its operation;</li>
            <li>use the Platform for unlawful, misleading, fraudulent, or deceptive purposes.</li>
          </ul>

          <h2 id="case-studies" className="text-2xl font-bold mb-4 font-poppins">10. Case Studies and Research Content</h2>
          <p className="mb-4">
            Case studies, articles, written commentary, and research materials published on Cargo Konect are prepared
            using research, publicly available information, industry interpretation, and analytical judgement.
          </p>
          <p className="mb-4">
            These materials reflect opinions, interpretations, and analytical perspectives. They do not constitute
            statements of guaranteed fact, legal advice, investment advice, operational advice, or professional
            recommendations.
          </p>
          <p className="mb-4">
            Cargo Konect makes no representation or warranty that any case study or research material is complete,
            definitive, error-free, or suitable for reliance in commercial or operational decision-making.
          </p>
          <p className="mb-4">
            Users remain solely responsible for verifying all facts, assumptions, and conclusions before relying on any
            case study or research material.
          </p>

          <h2 id="intellectual-property" className="text-2xl font-bold mb-4 mt-8 font-poppins">11. Intellectual Property</h2>
          <p className="mb-4">
            All rights, title, and interest in and to the Platform and its Content, including data arrangements,
            analytics logic, visualisations, dashboards, case studies, written content, branding, logos, design, and
            software, are owned by or licensed to Cargo Konect and are protected by applicable intellectual property
            laws.
          </p>
          <p className="mb-4">
            Users may not copy, reproduce, distribute, publish, transmit, display, modify, create derivative works
            from, sell, license, or commercially exploit any part of the Platform without prior written consent from
            Cargo Konect.
          </p>
          <p className="mb-4">
            Any unauthorised scraping, extraction, reuse, republication, resale, or repackaging of Platform Content is
            strictly prohibited and may result in legal action.
          </p>

          <h2 id="third-party" className="text-2xl font-bold mb-4 mt-8 font-poppins">12. Third-Party Sources and Links</h2>
          <p className="mb-4">
            The Platform may reference, incorporate, summarise, or link to third-party data, websites, publications,
            services, or information sources. Cargo Konect does not control and is not responsible for the content,
            availability, accuracy, or practices of such third parties.
          </p>
          <p className="mb-4">
            Inclusion of third-party references does not imply endorsement, approval, partnership, or verification by
            Cargo Konect unless expressly stated otherwise.
          </p>

          <h2 id="availability" className="text-2xl font-bold mb-4 mt-8 font-poppins">13. Service Availability</h2>
          <p className="mb-4">
            Cargo Konect does not guarantee that the Platform will always be available, uninterrupted, secure, or free
            from errors, bugs, delays, or outages.
          </p>
          <p className="mb-4">
            We may suspend, withdraw, discontinue, modify, or restrict access to any part of the Platform at any time,
            with or without notice, for business, security, maintenance, technical, legal, or operational reasons.
          </p>

          <h2 id="privacy" className="text-2xl font-bold mb-4 mt-8 font-poppins">14. Data Protection and Privacy</h2>
          <p className="mb-4">
            Cargo Konect is committed to handling personal information in accordance with applicable data protection laws,
            including the Protection of Personal Information Act, 2013 (POPIA), where applicable.
          </p>
          <p className="mb-4">
            By using the Platform, you acknowledge that Cargo Konect may collect, use, store, and process personal and
            technical information for legitimate business, security, service delivery, analytics, compliance, and
            platform improvement purposes.
          </p>
          <p className="mb-4">
            While reasonable technical and organisational safeguards may be used, no digital platform or method of
            transmission is completely secure, and Cargo Konect cannot guarantee absolute security.
          </p>

          <h2 id="indemnity" className="text-2xl font-bold mb-4 mt-8 font-poppins">15. Indemnity</h2>
          <p className="mb-4">
            You agree to indemnify, defend, and hold harmless Cargo Konect, its founders, affiliates, officers,
            employees, contractors, licensors, and agents from and against any claims, liabilities, losses, damages,
            costs, and expenses, including reasonable legal fees, arising out of or related to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>your use of or access to the Platform;</li>
            <li>your breach of these Terms;</li>
            <li>your misuse of Platform Content;</li>
            <li>your reliance on the Platform without independent verification;</li>
            <li>your violation of any law, regulation, or third-party right.</li>
          </ul>

          <h2 id="termination" className="text-2xl font-bold mb-4 mt-8 font-poppins">16. Suspension and Termination</h2>
          <p className="mb-4">
            Cargo Konect reserves the right, in its sole discretion, to suspend, restrict, or terminate your access to
            the Platform at any time and without prior notice where we reasonably believe that you have breached these
            Terms, created risk, acted unlawfully, or otherwise used the Platform in an unacceptable manner.
          </p>
          <p className="mb-4">
            Termination or suspension does not limit any other rights or remedies available to Cargo Konect.
          </p>

          <h2 id="liability" className="text-2xl font-bold mb-4 mt-8 font-poppins">17. Limitation of Liability</h2>
          <p className="mb-4">
            To the fullest extent permitted by law, Cargo Konect shall not be liable for any direct, indirect,
            incidental, consequential, special, punitive, or exemplary damages, including loss of profits, revenue,
            business opportunity, data, goodwill, operational continuity, or expected savings, arising out of or in
            connection with:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>your access to or use of the Platform;</li>
            <li>your inability to access or use the Platform;</li>
            <li>any inaccuracies, omissions, delays, interruptions, or errors in Platform Content;</li>
            <li>any reliance placed on Platform Content;</li>
            <li>any third-party information, systems, or sources referenced by the Platform.</li>
          </ul>
          <p className="mb-4">
            To the maximum extent permitted by law, Cargo Konect’s total aggregate liability for any claim arising out of
            or related to the Platform or these Terms shall not exceed the greater of (a) the amount paid by you to
            Cargo Konect, if any, in the 12 months preceding the event giving rise to the claim, or (b) R500.
          </p>

          <h2 id="governing-law" className="text-2xl font-bold mb-4 font-poppins">18. Governing Law</h2>
          <p className="mb-4">
            These Terms and Conditions shall be governed by and interpreted in accordance with the laws of the Republic
            of South Africa.
          </p>
          <p className="mb-4">
            Any dispute arising out of or in connection with these Terms or the use of the Platform shall be subject to
            the exclusive jurisdiction of the courts of South Africa, unless applicable law requires otherwise.
          </p>

          <h2 id="changes" className="text-2xl font-bold mb-4 font-poppins">19. Changes to Terms</h2>
          <p className="mb-4">
            Cargo Konect may update these Terms and Conditions from time to time. The updated version will be posted on
            this page with a revised effective date. It is your responsibility to review these Terms periodically.
          </p>
          <p className="mb-4">
            Continued use of the Platform after changes become effective constitutes your acceptance of the revised
            Terms.
          </p>

          <h2 id="contact" className="text-2xl font-bold mb-4 font-poppins">20. Contact Information</h2>
          <p className="mb-4">
            If you have any questions regarding these Terms and Conditions, please contact Cargo Konect at:
            <br />
            <strong>Email:</strong> info@cargokonect.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;