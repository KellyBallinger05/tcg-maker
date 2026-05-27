"use client";

import Link from "next/link";

type SignOutLinkProps = {
  className?: string;
};

export default function SignOutLink({ className }: SignOutLinkProps) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const confirmed = window.confirm(
      "Sign out? Any unsaved changes may be lost."
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <Link href="/auth/signout" onClick={handleClick} className={className}>
      Sign out
    </Link>
  );
}