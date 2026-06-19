import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BriefcaseBusiness,
  HeartPulse,
  House,
  Info,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

export interface LandingChallengeCard {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  iconColor: string;
}

export interface LandingProcessStep {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface LandingSecurityFeature {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface LandingFaqItem {
  question: string;
  answer: string;
}

export const challengeCards: LandingChallengeCard[] = [
  {
    eyebrow: "EMPLOYMENT",
    title: "Job Loss",
    description:
      "Immediate steps for securing benefits and stabilizing income.",
    icon: BriefcaseBusiness,
    accent: "#f2b8b5",
    iconColor: "#cb5a46",
  },
  {
    eyebrow: "HOUSING",
    title: "Rent Pressure",
    description:
      "Navigating tenant rights and emergency assistance programs.",
    icon: House,
    accent: "#8dc2ff",
    iconColor: "#5a9dff",
  },
  {
    eyebrow: "WELLNESS",
    title: "Healthcare Needs",
    description:
      "Accessing vital care and managing unexpected medical costs.",
    icon: Stethoscope,
    accent: "#7bc5ae",
    iconColor: "#2d7d67",
  },
  {
    eyebrow: "ECONOMY",
    title: "Financial Stress",
    description:
      "Structuring debt triage and prioritizing essential expenses.",
    icon: Landmark,
    accent: "#d9dfeb",
    iconColor: "#6f7b90",
  },
];

export const processSteps: LandingProcessStep[] = [
  {
    title: "Describe Situation",
    description:
      "Use natural language to explain what you're facing. Our secure interface guides you without demanding complex categorization.",
    icon: Info,
  },
  {
    title: "AI Analyzes Risk",
    description:
      "The engine identifies immediate risks, cross-references local resources, and synthesizes a structured situational awareness profile.",
    icon: Sparkles,
  },
  {
    title: "Get Roadmap",
    description:
      "Receive a pragmatic, step-by-step action plan prioritized by urgency and impact. No overwhelming lists, just the next right thing.",
    icon: ArrowRight,
  },
  {
    title: "Track Progress",
    description:
      "Mark milestones complete and adjust the plan as circumstances evolve, maintaining agency and control throughout the process.",
    icon: HeartPulse,
  },
];

export const securityFeatures: LandingSecurityFeature[] = [
  {
    title: "End-to-End Encryption",
    description:
      "All communications and data are encrypted using military-grade protocols.",
    icon: House,
  },
  {
    title: "Strict Data Privacy",
    description:
      "We never sell your personal information. Your story stays between you and the platform.",
    icon: ShieldCheck,
  },
  {
    title: "Total Confidentiality",
    description:
      "Access anonymized support paths and keep your crisis management private.",
    icon: Sparkles,
  },
  {
    title: "Protected Access",
    description:
      "Secure authentication safeguards every account session and keeps support plans protected.",
    icon: LockKeyhole,
  },
];

export const faqItems: LandingFaqItem[] = [
  {
    question: "How does the AI ensure my data is private?",
    answer:
      "We protect user data with encrypted transport, restricted access controls, and confidentiality-first workflows designed for sensitive crisis support.",
  },
  {
    question: "Can I use Civic Bridge AI for legal advice?",
    answer:
      "Civic Bridge AI helps organize urgent next steps and relevant resources, but it does not replace advice from a licensed legal professional.",
  },
  {
    question: "Is there a cost for using the platform?",
    answer:
      "The guided assessment experience is intended to stay accessible, with service details communicated clearly as the product expands.",
  },
  {
    question: "How long does the assessment take to complete?",
    answer:
      "Most people can complete the guided intake in just a few minutes, with the platform focusing only on the most relevant questions for immediate support.",
  },
  {
    question: "Can I update my situation after submitting an assessment?",
    answer:
      "Yes. Your next-step plan is designed to adapt as new information appears, so you can revisit and refine your situation as circumstances change.",
  },
];
