import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Regulamin</h1>

        <div className="space-y-6 text-gray-800 leading-relaxed">
          <p>
            Niniejszy Regulamin określa zasady korzystania z serwisu
            internetowego padii.pl oraz warunki świadczenia usług przez Jove Sp.
            z o.o.
          </p>

          <h2 className="text-2xl font-semibold mt-8">
            1. Postanowienia ogólne
          </h2>
          <p>
            Serwis padii.pl prowadzony jest przez Jove Sp. z o.o. z siedzibą
            przy ul. Prostej 21, 05-825 Szczęsne. Korzystanie z serwisu oznacza
            akceptację niniejszego regulaminu.
          </p>

          <h2 className="text-2xl font-semibold mt-8">
            2. Warunki korzystania
          </h2>
          <p>
            Użytkownik zobowiązuje się do korzystania z serwisu w sposób zgodny
            z obowiązującym prawem oraz dobrymi obyczajami. Zabronione jest
            podejmowanie działań mogących zakłócić działanie serwisu.
          </p>

          <h2 className="text-2xl font-semibold mt-8">
            3. Zamówienia i realizacja
          </h2>
          <p>
            Zamówienia składane za pośrednictwem serwisu są realizowane zgodnie
            z opisem oferty. Czas realizacji, dostępność oraz warunki dostawy są
            określone w odpowiednich sekcjach serwisu.
          </p>

          <h2 className="text-2xl font-semibold mt-8">4. Odpowiedzialność</h2>
          <p>
            Jove Sp. z o.o. nie ponosi odpowiedzialności za szkody wynikłe z
            nieprawidłowego korzystania z serwisu lub naruszenia warunków
            regulaminu przez użytkownika.
          </p>

          <h2 className="text-2xl font-semibold mt-8">
            5. Postanowienia końcowe
          </h2>
          <p>
            Regulamin może być zmieniany. Aktualna wersja jest zawsze dostępna
            na stronie. W sprawach nieuregulowanych stosuje się przepisy prawa
            polskiego.
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
