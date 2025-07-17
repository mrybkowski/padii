import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function DeliveryPaymentPage() {
  return (
    <>
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Dostawa i płatności</h1>

        <div className="space-y-6 text-gray-800 leading-relaxed">
          <p>
            Poniżej znajdziesz informacje dotyczące sposobów dostawy oraz metod
            płatności dostępnych w naszym serwisie.
          </p>

          <h2 className="text-2xl font-semibold mt-8">1. Dostawa</h2>
          <p>
            Realizujemy dostawy na terenie całej Polski za pośrednictwem
            renomowanych firm kurierskich. Czas realizacji zamówienia wynosi
            zazwyczaj 2-5 dni roboczych od momentu potwierdzenia płatności.
            Wysyłka towaru organizowana jest z magazynu głównego przy ul.
            Piaskowa 27, Grodzisk Mazowiecki 05-825.
          </p>
          <p>
            Koszt dostawy zależy od wybranej metody oraz wartości zamówienia i
            jest widoczny podczas składania zamówienia.
          </p>

          <h2 className="text-2xl font-semibold mt-8">2. Metody płatności</h2>
          <p>Oferujemy następujące metody płatności:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Płatność przelewem bankowym</li>
            <li>Płatność kartą kredytową lub debetową</li>
            <li>
              Płatność przez systemy płatności online (np. PayU, Przelewy24)
            </li>
            <li>Płatność przy odbiorze (za pobraniem)</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">
            3. Potwierdzenie płatności
          </h2>
          <p>
            Po zaksięgowaniu płatności otrzymasz od nas potwierdzenie e-mail z
            informacją o statusie zamówienia.
          </p>

          <h2 className="text-2xl font-semibold mt-8">
            4. Reklamacje dotyczące dostawy i płatności
          </h2>
          <p>
            W przypadku problemów z dostawą lub płatnością prosimy o kontakt na
            adres:{" "}
            <a
              href="mailto:biuro@padii.pl"
              className="text-primary underline hover:text-primary/80"
            >
              biuro@padii.pl
            </a>
            .
          </p>

          <p className="text-sm text-gray-600 mt-6">
            Data ostatniej aktualizacji: 17 lipca 2025 r.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
