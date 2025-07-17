"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Phone, MapPin, User, MessageSquare } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const contactSchema = z.object({
  name: z.string().min(2, "Podaj imię"),
  email: z.string().email("Niepoprawny email"),
  message: z.string().min(5, "Wiadomość jest za krótka"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    // Tu dodaj obsługę wysyłki, np. fetch do API lub email service
    console.log("Wysłano formularz:", data);
    alert("Dziękujemy za wiadomość!");
    reset();
  };

  return (
    <>
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Kontakt</h1>

        <div className="flex flex-col md:flex-row md:space-x-12">
          {/* Formularz */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 space-y-6"
            noValidate
          >
            <div>
              <label className="flex items-center space-x-2 mb-1 font-medium">
                <User className="w-5 h-5 text-primary" />
                <span>Imię</span>
              </label>
              <input
                type="text"
                {...register("name")}
                className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-primary"
                }`}
                placeholder="Twoje imię"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2 mb-1 font-medium">
                <Mail className="w-5 h-5 text-primary" />
                <span>Email</span>
              </label>
              <input
                type="email"
                {...register("email")}
                className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-primary"
                }`}
                placeholder="Twój email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2 mb-1 font-medium">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span>Wiadomość</span>
              </label>
              <textarea
                {...register("message")}
                rows={5}
                className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 resize-none ${
                  errors.message
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-primary"
                }`}
                placeholder="Napisz wiadomość..."
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-white rounded px-6 py-2 font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              {isSubmitting ? "Wysyłanie..." : "Wyślij"}
            </button>

            {isSubmitSuccessful && (
              <p className="text-green-600 mt-4 font-medium">
                Dziękujemy za wiadomość! Odezwę się najszybciej jak to możliwe.
              </p>
            )}
          </form>

          {/* Kontakt info + mapa */}
          <div className="mt-12 md:mt-0 md:w-80 space-y-8">
            <div className="flex items-center space-x-3">
              <Phone className="text-primary w-6 h-6" />
              <a href="tel:+48123456789" className="hover:underline">
                +48 123 456 789
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="text-primary w-6 h-6" />
              <a href="mailto:kontakt@padii.pl" className="hover:underline">
                kontakt@padii.pl
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="text-primary w-6 h-6" />
              <p>
                ul. Prosta 21
                <br />
                05-825 Szczęsne
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-300 shadow-md">
              <iframe
                title="Mapa lokalizacji Padii.pl"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2449.120301617399!2d21.005541516014753!3d52.229675979787215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471eccf66a6583f3%3A0xa99e4c3150bf27cc!2sWarszawa!5e0!3m2!1spl!2spl!4v1689625459479!5m2!1spl!2spl"
                width="100%"
                height="250"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="border-0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
