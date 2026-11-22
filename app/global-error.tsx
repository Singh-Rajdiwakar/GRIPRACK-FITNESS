"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import "./global-error.css";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Application error · GRIPRACK FITNESS</title>
        <link rel="icon" href="/griprack-mark.svg" />
      </head>
      <body>
        <main className="gr-failure">
          <Link prefetch={false} className="gr-failure-brand" href="/" aria-label="GRIPRACK FITNESS home">
            <span aria-hidden="true" /> GRIPRACK FITNESS
          </Link>
          <section>
            <h1>This page couldn’t load.</h1>
            <p>Reload the page to try again, or return to the homepage.</p>
            <nav aria-label="Recovery options">
              <button type="button" onClick={() => window.location.reload()}>Reload page</button>
              <Link prefetch={false} href="/">Back to home</Link>
            </nav>
          </section>
        </main>
      </body>
    </html>
  );
}
