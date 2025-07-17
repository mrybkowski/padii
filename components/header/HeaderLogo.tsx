import Link from "next/link";
import { PawPrint } from "lucide-react";

export function HeaderLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <PawPrint className="h-8 w-8 text-primary" />
      <span className="text-xl font-bold">Padii.pl</span>
    </Link>
  );
}
