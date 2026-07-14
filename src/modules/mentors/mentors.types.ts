import type { MentorExperience, MentorListItem, MentorProfile } from "../../shared/index.js";
import type { MentorVerificationStatus } from "../../shared/index.js";

/** mentor_profiles joined with users identity fields. */
export interface MentorProfileRow {
  id: string;
  user_id: string;
  full_name: string;
  photo_url: string | null;
  designation: string | null;
  company: string | null;
  years_of_experience: number;
  bio: string | null;
  base_session_price: string; // numeric → string from pg
  currency: string;
  default_session_minutes: number;
  timezone: string;
  verification_status: MentorVerificationStatus;
  is_accepting_bookings: boolean;
  rating_avg: string; // numeric → string
  rating_count: number;
}

export interface ExperienceRow {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  start_date: string | null; // to_char(...,'YYYY-MM-DD')
  end_date: string | null;
  description: string | null;
}

/** Row shape for a search-result list item (before categories are attached). */
export interface MentorListRow {
  id: string;
  full_name: string;
  photo_url: string | null;
  designation: string | null;
  company: string | null;
  base_session_price: string;
  currency: string;
  rating_avg: string;
  rating_count: number;
  years_of_experience: number;
}

export const toMentorProfile = (r: MentorProfileRow): MentorProfile => ({
  id: r.id,
  userId: r.user_id,
  fullName: r.full_name,
  photoUrl: r.photo_url,
  designation: r.designation,
  company: r.company,
  yearsOfExperience: r.years_of_experience,
  bio: r.bio,
  baseSessionPrice: Number(r.base_session_price),
  currency: r.currency,
  defaultSessionMinutes: r.default_session_minutes,
  timezone: r.timezone,
  verificationStatus: r.verification_status,
  isAcceptingBookings: r.is_accepting_bookings,
  ratingAvg: Number(r.rating_avg),
  ratingCount: r.rating_count,
});

export const toMentorExperience = (r: ExperienceRow): MentorExperience => ({
  id: r.id,
  title: r.title,
  company: r.company,
  location: r.location,
  startDate: r.start_date,
  endDate: r.end_date,
  description: r.description,
});

export const toMentorListItem = (
  r: MentorListRow,
  categories: MentorListItem["categories"],
): MentorListItem => ({
  id: r.id,
  fullName: r.full_name,
  photoUrl: r.photo_url,
  designation: r.designation,
  company: r.company,
  baseSessionPrice: Number(r.base_session_price),
  currency: r.currency,
  ratingAvg: Number(r.rating_avg),
  ratingCount: r.rating_count,
  yearsOfExperience: r.years_of_experience,
  categories,
});
