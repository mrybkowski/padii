import { Separator } from "@/components/ui/separator";
import { FooterNewsletter } from "./footer/FooterNewsletter";
import { FooterContact } from "./footer/FooterContact";
import { FooterBottom } from "./footer/FooterBottom";
import { FooterSection } from "./footer/FooterSecion";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FooterNewsletter />

        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FooterSection
            title="Padii.pl"
            description="Higiena dla Twojego psa"
            content="Jesteśmy polską firmą specjalizującą się w produktach higienicznych dla psów. Dbamy o komfort Twojego czworonoga od 2019 roku."
            type="company"
          />
          <FooterSection
            title="Produkty"
            links={[
              { label: "Podkłady 60x40 cm", href: "#" },
              { label: "Podkłady 60x60 cm", href: "#" },
              { label: "Podkłady 60x90 cm", href: "#" },
            ]}
          />
          <FooterSection
            title="Obsługa klienta"
            links={[
              { label: "Kontakt", href: "#" },
              { label: "Dostawa i płatność", href: "#" },
              { label: "Zwroty i reklamacje", href: "#" },
              { label: "Regulamin", href: "#" },
              { label: "Polityka prywatności", href: "#" },
            ]}
          />
          <FooterContact />
        </div>

        <Separator className="bg-gray-800" />
        <FooterBottom />
      </div>
    </footer>
  );
}
