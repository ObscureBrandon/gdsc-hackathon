"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            &larr; Back to home
          </Button>
        </Link>
        <h1 className="mb-2 text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="text-slate-300">Last updated: February 27, 2025</p>
      </div>

      <div className="space-y-6 text-slate-200">
        <div>
          <h2 className="mb-2 text-xl font-semibold text-lime-300">
            Introduction
          </h2>
          <p>
            League Wallet ("we", "our", or "us") is committed to protecting your
            privacy. This Privacy Policy explains how your personal information
            is collected, used, and disclosed by League Wallet. This Privacy
            Policy applies to our website and our mobile applications
            (collectively, our "Service").
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-lime-300">
            Information We Collect
          </h2>
          <p className="mb-2">
            We collect information that you provide directly to us, such as when
            you create an account, update your profile, use the interactive
            features of our Service, participate in contests, promotions, or
            surveys, request customer support, or otherwise communicate with us.
          </p>
          <p className="mb-2">
            The types of information we may collect include your name, email
            address, password, phone number, financial account information,
            transaction history, and any other information you choose to
            provide.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-lime-300">
            How We Use Your Information
          </h2>
          <p className="mb-2">
            We use the information we collect for various purposes, including
            to:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Provide, maintain, and improve our Service</li>
            <li>Process transactions and send related information</li>
            <li>
              Send you technical notices, updates, security alerts, and
              administrative messages
            </li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Provide customer service</li>
            <li>
              Monitor and analyze trends, usage, and activities in connection
              with our Service
            </li>
            <li>
              Detect, investigate, and prevent fraudulent transactions and other
              illegal activities
            </li>
            <li>Personalize and improve the Service</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-lime-300">
            Data Security
          </h2>
          <p>
            We take reasonable measures to help protect information about you
            from loss, theft, misuse, unauthorized access, disclosure,
            alteration, and destruction. However, no security system is
            impenetrable, and we cannot guarantee the security of our systems or
            your information.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-lime-300">
            Changes to this Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. If we make
            changes, we will notify you by revising the date at the top of the
            policy and, in some cases, we may provide you with additional notice
            (such as adding a statement to our website or sending you a
            notification).
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-lime-300">
            Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at:
            <a
              href="mailto:support@leaguewallet.com"
              className="ml-1 text-lime-300 hover:underline"
            >
              support@leaguewallet.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
