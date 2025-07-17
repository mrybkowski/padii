import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ReturnsPage() {
  return (
    <>
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Zwroty i reklamacje</h1>

        <div className="space-y-6 text-gray-800 leading-relaxed">
          <p>
            Niniejszy dokument określa zasady składania reklamacji oraz
            odstąpienia od umowy dla produktów i usług oferowanych przez Jove
            Sp. z o.o.
          </p>

          <h2 className="text-2xl font-semibold mt-8">
            1. Odstąpienie od umowy
          </h2>
          <p>
            Konsument ma prawo do odstąpienia od umowy w terminie 14 dni
            kalendarzowych od dnia zawarcia umowy (lub otrzymania produktu), bez
            podawania przyczyny.
          </p>
          <p>
            Aby skorzystać z prawa odstąpienia od umowy, należy poinformować nas
            o swojej decyzji drogą mailową na adres:{" "}
            <a
              href="mailto:biuro@padii.pl"
              className="text-primary underline hover:text-primary/80"
            >
              biuro@padii.pl
            </a>
            .
          </p>

          <h2 className="text-2xl font-semibold mt-8">2. Reklamacje</h2>
          <p>
            W przypadku nieprawidłowości w działaniu serwisu lub wad produktu,
            klient ma prawo złożyć reklamację. Reklamację można złożyć wysyłając
            wiadomość e-mail na adres:{" "}
            <a
              href="mailto:reklamacje@padii.pl"
              className="text-primary underline hover:text-primary/80"
            >
              reklamacje@padii.pl
            </a>
            .
          </p>
          <p>
            Reklamacja powinna zawierać: imię i nazwisko, adres e-mail, opis
            problemu oraz oczekiwania wobec reklamacji.
          </p>
          <p>
            Rozpatrzenie reklamacji nastąpi w ciągu 14 dni roboczych od dnia jej
            otrzymania.
          </p>

          <h2 className="text-2xl font-semibold mt-8">3. Zwrot środków</h2>
          <p>
            W przypadku uznania odstąpienia od umowy lub reklamacji, zwrot
            środków zostanie dokonany na podany przez klienta rachunek bankowy w
            ciągu 14 dni.
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
