import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Polityka prywatności</h1>

        <div className="space-y-6 text-gray-800 leading-relaxed">
          <p>
            Niniejsza Polityka Prywatności określa zasady przetwarzania i
            ochrony danych osobowych przekazanych przez Użytkowników w związku z
            korzystaniem z serwisu internetowego padii.pl.
          </p>

          <h2 className="text-2xl font-semibold mt-8">
            1. Administrator danych
          </h2>
          <p>
            Administratorem danych osobowych jest Jove Sp. z o.o. z siedzibą
            przy ul. Prostej 21, 05-825 Szczęsne.
          </p>

          <h2 className="text-2xl font-semibold mt-8">
            2. Zakres zbieranych danych
          </h2>
          <p>
            Zbieramy dane takie jak: imię, adres e-mail, numer telefonu – tylko
            jeśli użytkownik samodzielnie je przekaże np. poprzez formularz
            kontaktowy.
          </p>

          <h2 className="text-2xl font-semibold mt-8">
            3. Cel przetwarzania danych
          </h2>
          <p>Dane osobowe przetwarzane są w celu:</p>
          <ul className="list-disc list-inside mt-2">
            <li>
              udzielenia odpowiedzi na zapytania przesłane przez formularz,
            </li>
            <li>realizacji usług zamówionych przez użytkownika,</li>
            <li>kontaktu w sprawach związanych z ofertą.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">4. Prawa użytkownika</h2>
          <p>
            Każdy użytkownik ma prawo dostępu do swoich danych, ich poprawiania,
            usunięcia lub ograniczenia przetwarzania. Można też wnieść sprzeciw
            wobec przetwarzania lub złożyć skargę do organu nadzorczego.
          </p>

          <h2 className="text-2xl font-semibold mt-8">
            5. Udostępnianie danych
          </h2>
          <p>
            Dane osobowe nie są udostępniane podmiotom trzecim, chyba że wymaga
            tego obowiązujące prawo.
          </p>

          <h2 className="text-2xl font-semibold mt-8">6. Pliki cookies</h2>
          <p>
            Serwis może korzystać z plików cookies w celu analizy ruchu oraz
            poprawy jakości usług. Użytkownik może zarządzać plikami cookies w
            ustawieniach swojej przeglądarki.
          </p>

          <h2 className="text-2xl font-semibold mt-8">
            7. Zmiany w polityce prywatności
          </h2>
          <p>
            Zastrzegamy sobie prawo do zmian w niniejszej polityce. Aktualna
            wersja będzie zawsze publikowana na tej stronie.
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
