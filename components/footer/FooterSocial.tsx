import { Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "../ui/button";

export function FooterSocials() {
  const icons = [Facebook, Instagram, Twitter];

  return (
    <div className="flex space-x-4">
      {icons.map((Icon, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <Icon className="h-5 w-5" />
        </Button>
      ))}
    </div>
  );
}
