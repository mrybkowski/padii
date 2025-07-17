import { Mail, MapPin, Phone } from "lucide-react";

export function FooterContact() {
  return (
    <div className="space-y-4">
      <h3 className="font-bold">Kontakt</h3>
      <div className="space-y-3 text-gray-400">
        <div className="flex items-center space-x-3">
          <Phone className="h-5 w-5" />
          <span>+48 519 439 762</span>
        </div>
        <div className="flex items-center space-x-3">
          <Mail className="h-5 w-5" />
          <span>biuro@padii.pl</span>
        </div>
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 mt-1" />
          <div>
            <div>ul. Prosta 21</div>
            <div>05-825 Szczęsne</div>
          </div>
        </div>
      </div>
    </div>
  );
}
