import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-gold/30 bg-brand-gold/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Left: Copyright */}
          <p className="text-[10px] sm:text-xs text-neutral-500">
            © {currentYear} All rights reserved
          </p>

          {/* Right: Developed by */}
          <Link
            href="https://zsoltmarku.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 sm:gap-2 transition-opacity hover:opacity-80">
            <span className="text-[10px] sm:text-xs text-neutral-500">
              Developed by
            </span>
            <Image
              src="/images/zsmwebdev-logo.webp"
              alt="ZSM Web Dev"
              width={32}
              height={32}
              className="rounded-full bg-brand-navy p-0.5 w-5 h-5 sm:w-8 sm:h-8"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
