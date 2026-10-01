import {
  Bot,
  Newspaper,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

// One list of Premium features, shared by the login/register side panel
// and the /premium page; `available: false` shows a "Bald" badge on
// /premium - flip it to true once the feature actually ships
export const PREMIUM_FEATURES: {
  icon: LucideIcon;
  title: string;
  text: string;
  available: boolean;
}[] = [
  {
    icon: Newspaper,
    title: "Kultur-Briefing",
    text: "Der Tag in Kunst & Kultur, täglich für dich zusammengefasst",
    available: true,
  },
  {
    icon: SlidersHorizontal,
    title: "Persönlicher Feed",
    text: "News, gefiltert nach deinen Interessen",
    available: false,
  },
  {
    icon: Bot,
    title: "AI-Kultur-Agent",
    text: "Frag den Feed – dein persönlicher Kurator für Kunst & Kultur",
    available: false,
  },
];
