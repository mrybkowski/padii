import { Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

const socials = [
  { icon: Facebook, href: "https://facebook.com" },
  { icon: Instagram, href: "https://instagram.com" },
  { icon: Twitter, href: "https://twitter.com" },
];

export function FooterSocials() {
  return (
    <div className="flex space-x-4">
      {socials.map(({ icon: Icon, href }, index) => (
        <Link
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
        >
          <Icon className="h-5 w-5 text-white" />
        </Link>
      ))}
    </div>
  );
}
