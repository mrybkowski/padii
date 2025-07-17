import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function FooterNewsletter() {
  return (
    <div className="py-12 border-b border-gray-800">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-2xl font-bold mb-2">Bądź na bieżąco!</h3>
          <p className="text-gray-400">
            Zapisz się do naszego newslettera i otrzymuj informacje o
            nowościach, promocjach i poradach dla właścicieli psów.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <Input
            type="email"
            placeholder="Twój adres email"
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
          <Button className="bg-primary hover:bg-primary/90">Zapisz się</Button>
        </div>
      </div>
    </div>
  );
}
