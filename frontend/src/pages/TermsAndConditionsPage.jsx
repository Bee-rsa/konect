import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { acceptTerms } from "../redux/slices/authSlice";

const TermsAcceptancePage = () => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [checked, setChecked] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    const result = await dispatch(acceptTerms());

    if (acceptTerms.fulfilled.match(result)) {
      navigate("/welcome");
    }
  };

  return (
    <div className="h-screen overflow-hidden font-poppins bg-white px-3 py-3 md:px-4 md:py-4">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 md:px-5 md:py-4">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
            Terms and Conditions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Please read through the terms before continuing.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-4 py-3 md:px-5 md:py-4">
          <div
            onScroll={handleScroll}
            className="h-[58vh] md:h-[56vh] overflow-y-auto rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-700"
          >
            <p className="mb-4">
              <strong>Effective Date:</strong> 28th April 2026
            </p>

            <p className="mb-4">
              Welcome to Cargo Konect. By accessing or using our platform,
              website, analytics tools, case studies, reports, visualisations,
              and related content, you agree to comply with and be bound by
              these Terms and Conditions. These Terms govern your use of Cargo
              Konect and all content, functionality, and services made available
              through the platform. If you do not agree to these Terms, you must
              not use Cargo Konect.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              1. Definitions
            </h2>
            <p className="mb-4">
              “Cargo Konect” refers to the digital platform operated under the
              Cargo Konect name, providing maritime, port, and terminal-related
              analytics, insights, research content, and supporting information.
            </p>
            <p className="mb-4">
              “Platform” refers to the Cargo Konect website, digital services,
              dashboards, analytics tools, terminal berthing information, case
              studies, reports, visual content, and all related features and
              materials.
            </p>
            <p className="mb-4">
              “User” refers to any individual, company, organisation, or entity
              that accesses or uses the Platform.
            </p>
            <p className="mb-4">
              “Content” includes all text, data, analytics, schedules,
              estimates, reports, graphics, visualisations, commentary,
              opinions, research, case studies, and other materials made
              available on the Platform.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              2. Acceptance of Terms
            </h2>
            <p className="mb-4">
              By accessing or using Cargo Konect, you confirm that you have
              read, understood, and agreed to these Terms and Conditions. If you
              do not agree, you must immediately stop using the Platform.
            </p>
            <p className="mb-4">
              By using the Platform, you acknowledge that Cargo Konect provides
              informational and analytical content only and does not provide
              operational, financial, legal, commercial, or logistical advice.
            </p>
            <p className="mb-4">
              Cargo Konect reserves the right to modify, amend, or update these
              Terms at any time. Continued use of the Platform after changes are
              published constitutes your acceptance of the revised Terms.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              3. User Eligibility
            </h2>
            <p className="mb-4">
              You must be at least 18 years old or otherwise have the legal
              capacity to enter into a binding agreement in order to use the
              Platform. If you are using Cargo Konect on behalf of a company or
              other legal entity, you represent that you have the authority to
              bind that entity to these Terms.
            </p>
            <p className="mb-4">
              You agree to use the Platform only in compliance with applicable
              laws, regulations, and industry standards.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              4. Account Registration and Security
            </h2>
            <p className="mb-4">
              Certain features of the Platform may require registration. Where
              registration is required, you agree to provide accurate, complete,
              and current information and to keep that information updated.
            </p>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activity conducted under your
              account. Cargo Konect reserves the right to suspend or terminate
              accounts where information is false, misleading, incomplete, or
              used in breach of these Terms.
            </p>
            <p className="mb-4">
              You must notify Cargo Konect immediately if you suspect any
              unauthorised use of your account or any breach of security.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              5. Platform Use
            </h2>
            <p className="mb-4">
              Cargo Konect provides access to maritime, port, and
              terminal-related data, analytics, research, and insights for
              informational purposes only.
            </p>
            <p className="mb-4">
              Cargo Konect does not provide shipping, freight forwarding,
              customs, warehousing, terminal operations, brokerage,
              transportation, booking, or transactional services. Cargo Konect
              is not a carrier, port authority, logistics operator, freight
              broker, or shipping agent.
            </p>
            <p className="mb-4">
              No content on the Platform creates a contractual relationship
              between Cargo Konect and any User in respect of vessel movement,
              cargo handling, berth access, terminal allocation, freight
              movement, shipment execution, or operational performance.
            </p>
            <p className="mb-4">
              Users acknowledge that the Platform is an informational tool only
              and must not be treated as an official source of port authority
              instruction, berth confirmation, legal notice, or commercial
              commitment.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              6. Data Accuracy and No Warranty
            </h2>
            <p className="mb-4">
              Cargo Konect aims to provide useful and relevant information, but
              we do not guarantee that any Content is accurate, complete,
              current, uninterrupted, error-free, or suitable for your intended
              purpose.
            </p>
            <p className="mb-4">
              Platform Content may include delays, omissions, estimation-based
              outputs, historical interpretations, forward-looking observations,
              incomplete information, third-party sourced information, or data
              that changes without notice.
            </p>
            <p className="mb-4">
              Cargo Konect makes no warranties or representations regarding
              vessel schedules, terminal availability, port-side activity, berth
              windows, operational conditions, turnaround times, congestion
              patterns, or any other live or inferred industry information.
            </p>
            <p className="mb-4">
              All information is provided on an “as is” and “as available”
              basis, without warranties of any kind, whether express or implied.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              7. No Reliance / Use at Own Risk
            </h2>
            <p className="mb-4">
              Your use of the Platform and reliance on any Content is entirely
              at your own risk. You are solely responsible for independently
              verifying information before acting on it.
            </p>
            <p className="mb-4">
              Cargo Konect shall not be responsible for any decision, action, or
              omission made by you or any third party based on the Platform or
              its Content, including but not limited to operational planning,
              commercial decisions, scheduling, dispatching, cargo handling,
              negotiations, risk allocation, or business strategy.
            </p>
            <p className="mb-4">
              The Platform is not a substitute for official port authority
              publications, terminal operator notices, vessel agents, shipping
              line communications, contractual documents, legal advice, or
              specialist professional services.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              8. User Responsibilities
            </h2>
            <p className="mb-4">
              You agree to use the Platform lawfully, responsibly, and in a
              manner that does not interfere with the operation, security,
              integrity, or reputation of Cargo Konect.
            </p>
            <p className="mb-4">
              You are responsible for ensuring that any interpretation, use, or
              implementation of Platform Content is appropriate for your
              circumstances and supported by independent review where required.
            </p>
            <p className="mb-4">
              Where you submit information to the Platform, you warrant that
              such information is accurate, lawful, and does not infringe the
              rights of any person or entity.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              9. Acceptable Use Restrictions
            </h2>
            <p className="mb-4">You may not use the Platform to:</p>
            <ul className="mb-4 list-disc space-y-1 pl-6">
              <li>scrape, copy, mine, extract, or harvest data at scale;</li>
              <li>
                reverse engineer, decompile, or attempt to replicate any part of
                the Platform;
              </li>
              <li>
                use bots, scripts, crawlers, or automated tools without written
                consent;
              </li>
              <li>
                reproduce, republish, sell, licence, or commercially exploit
                Platform Content without permission;
              </li>
              <li>
                misrepresent Cargo Konect Content as official port, terminal,
                government, or shipping line data;
              </li>
              <li>
                upload or transmit harmful code, malware, or malicious material;
              </li>
              <li>
                use the Platform in any way that could damage, disable,
                overburden, or impair its operation;
              </li>
              <li>
                use the Platform for unlawful, misleading, fraudulent, or
                deceptive purposes.
              </li>
            </ul>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              10. Case Studies and Research Content
            </h2>
            <p className="mb-4">
              Case studies, articles, written commentary, and research
              materials published on Cargo Konect are prepared using research,
              publicly available information, industry interpretation, and
              analytical judgement.
            </p>
            <p className="mb-4">
              These materials reflect opinions, interpretations, and analytical
              perspectives. They do not constitute statements of guaranteed
              fact, legal advice, investment advice, operational advice, or
              professional recommendations.
            </p>
            <p className="mb-4">
              Cargo Konect makes no representation or warranty that any case
              study or research material is complete, definitive, error-free, or
              suitable for reliance in commercial or operational
              decision-making.
            </p>
            <p className="mb-4">
              Users remain solely responsible for verifying all facts,
              assumptions, and conclusions before relying on any case study or
              research material.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              11. Intellectual Property
            </h2>
            <p className="mb-4">
              All rights, title, and interest in and to the Platform and its
              Content, including data arrangements, analytics logic,
              visualisations, dashboards, case studies, written content,
              branding, logos, design, and software, are owned by or licensed
              to Cargo Konect and are protected by applicable intellectual
              property laws.
            </p>
            <p className="mb-4">
              Users may not copy, reproduce, distribute, publish, transmit,
              display, modify, create derivative works from, sell, license, or
              commercially exploit any part of the Platform without prior
              written consent from Cargo Konect.
            </p>
            <p className="mb-4">
              Any unauthorised scraping, extraction, reuse, republication,
              resale, or repackaging of Platform Content is strictly prohibited
              and may result in legal action.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              12. Third-Party Sources and Links
            </h2>
            <p className="mb-4">
              The Platform may reference, incorporate, summarise, or link to
              third-party data, websites, publications, services, or
              information sources. Cargo Konect does not control and is not
              responsible for the content, availability, accuracy, or practices
              of such third parties.
            </p>
            <p className="mb-4">
              Inclusion of third-party references does not imply endorsement,
              approval, partnership, or verification by Cargo Konect unless
              expressly stated otherwise.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              13. Service Availability
            </h2>
            <p className="mb-4">
              Cargo Konect does not guarantee that the Platform will always be
              available, uninterrupted, secure, or free from errors, bugs,
              delays, or outages.
            </p>
            <p className="mb-4">
              We may suspend, withdraw, discontinue, modify, or restrict access
              to any part of the Platform at any time, with or without notice,
              for business, security, maintenance, technical, legal, or
              operational reasons.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              14. Data Protection and Privacy
            </h2>
            <p className="mb-4">
              Cargo Konect is committed to handling personal information in
              accordance with applicable data protection laws, including the
              Protection of Personal Information Act, 2013 (POPIA), where
              applicable.
            </p>
            <p className="mb-4">
              By using the Platform, you acknowledge that Cargo Konect may
              collect, use, store, and process personal and technical
              information for legitimate business, security, service delivery,
              analytics, compliance, and platform improvement purposes.
            </p>
            <p className="mb-4">
              While reasonable technical and organisational safeguards may be
              used, no digital platform or method of transmission is completely
              secure, and Cargo Konect cannot guarantee absolute security.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              15. Indemnity
            </h2>
            <p className="mb-4">
              You agree to indemnify, defend, and hold harmless Cargo Konect,
              its founders, affiliates, officers, employees, contractors,
              licensors, and agents from and against any claims, liabilities,
              losses, damages, costs, and expenses, including reasonable legal
              fees, arising out of or related to:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6">
              <li>your use of or access to the Platform;</li>
              <li>your breach of these Terms;</li>
              <li>your misuse of Platform Content;</li>
              <li>
                your reliance on the Platform without independent verification;
              </li>
              <li>
                your violation of any law, regulation, or third-party right.
              </li>
            </ul>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              16. Suspension and Termination
            </h2>
            <p className="mb-4">
              Cargo Konect reserves the right, in its sole discretion, to
              suspend, restrict, or terminate your access to the Platform at any
              time and without prior notice where we reasonably believe that you
              have breached these Terms, created risk, acted unlawfully, or
              otherwise used the Platform in an unacceptable manner.
            </p>
            <p className="mb-4">
              Termination or suspension does not limit any other rights or
              remedies available to Cargo Konect.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              17. Limitation of Liability
            </h2>
            <p className="mb-4">
              To the fullest extent permitted by law, Cargo Konect shall not be
              liable for any direct, indirect, incidental, consequential,
              special, punitive, or exemplary damages, including loss of
              profits, revenue, business opportunity, data, goodwill,
              operational continuity, or expected savings, arising out of or in
              connection with:
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6">
              <li>your access to or use of the Platform;</li>
              <li>your inability to access or use the Platform;</li>
              <li>
                any inaccuracies, omissions, delays, interruptions, or errors in
                Platform Content;
              </li>
              <li>any reliance placed on Platform Content;</li>
              <li>
                any third-party information, systems, or sources referenced by
                the Platform.
              </li>
            </ul>
            <p className="mb-4">
              To the maximum extent permitted by law, Cargo Konect’s total
              aggregate liability for any claim arising out of or related to the
              Platform or these Terms shall not exceed the greater of (a) the
              amount paid by you to Cargo Konect, if any, in the 12 months
              preceding the event giving rise to the claim, or (b) R500.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              18. Governing Law
            </h2>
            <p className="mb-4">
              These Terms and Conditions shall be governed by and interpreted in
              accordance with the laws of the Republic of South Africa.
            </p>
            <p className="mb-4">
              Any dispute arising out of or in connection with these Terms or
              the use of the Platform shall be subject to the exclusive
              jurisdiction of the courts of South Africa, unless applicable law
              requires otherwise.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              19. Changes to Terms
            </h2>
            <p className="mb-4">
              Cargo Konect may update these Terms and Conditions from time to
              time. The updated version will be posted on this page with a
              revised effective date. It is your responsibility to review these
              Terms periodically.
            </p>
            <p className="mb-4">
              Continued use of the Platform after changes become effective
              constitutes your acceptance of the revised Terms.
            </p>

            <h2 className="mb-3 text-base font-semibold text-slate-900">
              20. Contact Information
            </h2>
            <p className="mb-4">
              If you have any questions regarding these Terms and Conditions,
              please contact Cargo Konect at:
              <br />
              <strong>Email:</strong> info@cargokonect.com
            </p>

            <p className="mt-8 text-center text-slate-400">— End of Terms —</p>
          </div>

          <div className="pt-2">
            <div className="flex items-start gap-3">
              <input
                id="terms-checkbox"
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-custom-blue focus:ring-1 focus:ring-custom-blue"
              />
              <label
                htmlFor="terms-checkbox"
                className="text-sm leading-6 text-slate-700"
              >
                I have read and accept the Terms and Conditions
              </label>
            </div>

            <button
              onClick={handleAccept}
              disabled={!hasScrolledToBottom || !checked || loading}
              className="mt-8 w-full rounded-xl border border-custom-blue bg-custom-blue px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Processing..." : "Accept & Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAcceptancePage;