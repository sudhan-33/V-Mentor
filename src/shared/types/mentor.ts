import type { MentorVerificationStatus } from "../enums.js";
import type { Category, ExpertiseTag, Language } from "./catalog.js";

export interface MentorExperience {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
}

/** Mentor profile joined with the user's identity fields. */
export interface MentorProfile {
  id: string; // mentor_profiles.id
  userId: string;
  fullName: string;
  photoUrl: string | null;
  designation: string | null;
  company: string | null;
  yearsOfExperience: number;
  bio: string | null;
  baseSessionPrice: number;
  currency: string;
  defaultSessionMinutes: number;
  timezone: string;
  verificationStatus: MentorVerificationStatus;
  isAcceptingBookings: boolean;
  ratingAvg: number;
  ratingCount: number;
}

/** Compact shape for search-result cards. */
export interface MentorListItem {
  id: string;
  fullName: string;
  photoUrl: string | null;
  designation: string | null;
  company: string | null;
  baseSessionPrice: number;
  currency: string;
  ratingAvg: number;
  ratingCount: number;
  yearsOfExperience: number;
  categories: Pick<Category, "id" | "name" | "slug">[];
}

/** Full public mentor profile with related collections. */
export interface MentorDetail extends MentorProfile {
  experiences: MentorExperience[];
  categories: Category[];
  expertise: ExpertiseTag[];
  languages: Language[];
}
