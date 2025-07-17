import { HeaderActionButtons } from "./header/HeaderActionButtons";
import { HeaderDesktopNav } from "./header/HeaderDesktopNav";
import { HeaderLogo } from "./header/HeaderLogo";
import { HeaderSearchBar } from "./header/HeaderSearchBar";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <HeaderLogo />
          <HeaderDesktopNav />
          <HeaderSearchBar />
          <HeaderActionButtons />
        </div>
      </div>
    </header>
  );
}
