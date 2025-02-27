"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function TermsOfServicePage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            &larr; Back to home
          </Button>
        </Link>
        <h1 className="mb-2 text-3xl font-bold text-white">Terms of Service</h1>
        <p className="text-slate-300">Last updated: February 27, 2025</p>
      </div>

      <div className="space-y-6 text-slate-200">
        <div>
          <h2 className="mb-2 text-xl font-semibold text-lime-300">
            Agreement to Terms
          </h2>
          <p>
            By accessing or using League Wallet, you agree to be bound by these
            Terms of Service and all applicable laws and regulations. If you do
            not agree with any of these terms, you are prohibited from using or
            accessing this service.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-lime-300">
            Use License
          </h2>
          <p className="mb-2">
            League Wallet grants you a limited, non-exclusive, non-transferable,
            revocable license to access and use our Service for your personal,
            non-commercial use. This license is subject to these Terms of
            Service.
          </p>
          <p>You may not:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Modify or copy the materials</li>
            <li>
              Use the materials for any commercial purpose or for any public
              display
            </li>
            <li>
              Attempt to decompile or reverse engineer any software contained in
              League Wallet
            </li>
            <li>
              Remove any copyright or other proprietary notations from the
              materials
            </li>
            <li>
              Transfer the materials to another person or "mirror" the materials
              on any other server
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-lime-300">
            User Accounts
          </h2>
          <p className="mb-2">
            When you create an account with us, you must provide information
            that is accurate, complete, and current at all times. Failure to do
            so constitutes a breach of the Terms, which may result in immediate
            termination of your account on our Service.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to
            access the Service and for any activities or actions under your
            password. You agree not to disclose your password to any third
            party. You must notify us immediately upon becoming aware of any
            breach of security or unauthorized use of your account.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-lime-300">
            Limitation of Liability
          </h2>
          <p>
            In no event shall League Wallet, nor its directors, employees,
            partners, agents, suppliers, or affiliates, be liable for any
            indirect, incidental, special, consequential or punitive damages,
            including without limitation, loss of profits, data, use, goodwill,
            or other intangible losses, resulting from your access to or use of
            or inability to access or use the Service.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-lime-300">
            Changes to Terms
          </h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. If a revision is material, we will try to
            provide at least 30 days' notice prior to any new terms taking
            effect. What constitutes a material change will be determined at our
            sole discretion.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-lime-300">
            Contact Us
          </h2>
          <p>
            If you have any questions about these Terms, please contact us at:
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
