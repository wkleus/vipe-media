import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Impressum", // rendered as "Impressum · VIPE Media" via title template
  description: "Impressum und Anbieterkennzeichnung von VIPE Media.",
};

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum" updated="September 2026">
      <LegalSection heading="Angaben gemäß § 5 DDG">
        <p>
          VIPE Media
          <br />
          [Vor- und Nachname / Firmenname]
          <br />
          [Straße und Hausnummer]
          <br />
          [PLZ und Ort]
          <br />
          Deutschland
        </p>
      </LegalSection>

      <LegalSection heading="Kontakt">
        <p>
          E-Mail: [example@examplemail.com]
          <br />
          Telefon: [optional]
        </p>
      </LegalSection>

      <LegalSection heading="Vertretungsberechtigt">
        <p>
          [Name der vertretungsberechtigten Person, bei GbR: alle
          Gesellschafter]
        </p>
      </LegalSection>

      <LegalSection heading="Umsatzsteuer-ID">
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [DE XXXXXXXXX]
        </p>
      </LegalSection>

      <LegalSection heading="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <p>
          [Vor- und Nachname]
          <br />
          [Straße und Hausnummer, PLZ und Ort]
        </p>
      </LegalSection>

      <LegalSection heading="Streitschlichtung">
        <p>
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:{" "}
          https://ec.europa.eu/consumers/odr. Wir sind nicht bereit oder
          verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </LegalSection>

      <LegalSection heading="Haftung für Inhalte und Links">
        <p>
          Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach
          den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht
          verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
          überwachen. Für Inhalte externer Links sind ausschließlich deren
          Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung waren keine
          rechtswidrigen Inhalte erkennbar.
        </p>
      </LegalSection>

      <LegalSection heading="Urheberrecht">
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte unterliegen dem
          deutschen Urheberrecht. Artikeltexte und Bilder von Drittanbietern
          werden mit Quellenangabe dargestellt; die Rechte verbleiben bei den
          jeweiligen Rechteinhabern.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
