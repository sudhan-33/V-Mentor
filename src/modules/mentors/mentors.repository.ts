import { query, withTransaction } from "../../config/db.js";
import type {
  Category,
  CreateExperienceInput,
  ExpertiseTag,
  Language,
  MentorSearchQuery,
  MentorVerificationStatus,
  UpdateExperienceInput,
  UpdateMentorProfileInput,
} from "../../shared/index.js";
import {
  toCategory,
  toExpertiseTag,
  toLanguage,
  type CategoryRow,
  type ExpertiseTagRow,
  type LanguageRow,
} from "../catalog/catalog.types.js";
import { offset } from "../../common/pagination.js";
import type { ExperienceRow, MentorListRow, MentorProfileRow } from "./mentors.types.js";

const PROFILE_COLS = `
  mp.id, mp.user_id, u.full_name, u.photo_url, mp.designation, mp.company,
  mp.years_of_experience, mp.bio, mp.base_session_price, mp.currency,
  mp.default_session_minutes, mp.timezone, mp.verification_status,
  mp.is_accepting_bookings, mp.rating_avg, mp.rating_count`;

const PROFILE_FROM = `FROM mentor_profiles mp JOIN users u ON u.id = mp.user_id`;

const EXPERIENCE_COLS = `id, title, company, location,
  to_char(start_date, 'YYYY-MM-DD') AS start_date,
  to_char(end_date, 'YYYY-MM-DD') AS end_date, description`;

// ---- Profile ------------------------------------------------------------

export async function findProfileByUserId(userId: string): Promise<MentorProfileRow | null> {
  const rows = await query<MentorProfileRow>(
    `SELECT ${PROFILE_COLS} ${PROFILE_FROM} WHERE mp.user_id = $1 AND mp.deleted_at IS NULL`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function findProfileById(id: string): Promise<MentorProfileRow | null> {
  const rows = await query<MentorProfileRow>(
    `SELECT ${PROFILE_COLS} ${PROFILE_FROM} WHERE mp.id = $1 AND mp.deleted_at IS NULL`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findVerifiedProfileById(id: string): Promise<MentorProfileRow | null> {
  const rows = await query<MentorProfileRow>(
    `SELECT ${PROFILE_COLS} ${PROFILE_FROM}
      WHERE mp.id = $1 AND mp.deleted_at IS NULL AND mp.verification_status = 'verified'`,
    [id],
  );
  return rows[0] ?? null;
}

export async function updateProfileByUserId(
  userId: string,
  patch: UpdateMentorProfileInput,
): Promise<void> {
  const map: Record<string, string> = {
    designation: "designation",
    company: "company",
    yearsOfExperience: "years_of_experience",
    bio: "bio",
    baseSessionPrice: "base_session_price",
    currency: "currency",
    defaultSessionMinutes: "default_session_minutes",
    timezone: "timezone",
    isAcceptingBookings: "is_accepting_bookings",
  };
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const [key, col] of Object.entries(map)) {
    const val = (patch as Record<string, unknown>)[key];
    if (val !== undefined) {
      params.push(val);
      sets.push(`${col} = $${params.length}`);
    }
  }
  if (sets.length === 0) return;
  params.push(userId);
  await query(
    `UPDATE mentor_profiles SET ${sets.join(", ")} WHERE user_id = $${params.length}`,
    params,
  );
}

export async function setVerificationStatus(
  mentorId: string,
  status: MentorVerificationStatus,
): Promise<MentorProfileRow | null> {
  const updated = await query<{ id: string }>(
    `UPDATE mentor_profiles SET verification_status = $2 WHERE id = $1 RETURNING id`,
    [mentorId, status],
  );
  if (updated.length === 0) return null;
  return findProfileById(mentorId);
}

export async function listPendingProfiles(): Promise<MentorProfileRow[]> {
  return query<MentorProfileRow>(
    `SELECT ${PROFILE_COLS} ${PROFILE_FROM}
      WHERE mp.deleted_at IS NULL AND mp.verification_status = 'pending'
      ORDER BY mp.created_at`,
  );
}

// ---- Experiences --------------------------------------------------------

export async function listExperiences(mentorId: string): Promise<ExperienceRow[]> {
  return query<ExperienceRow>(
    `SELECT ${EXPERIENCE_COLS} FROM mentor_experiences
      WHERE mentor_id = $1 ORDER BY start_date DESC NULLS LAST, created_at DESC`,
    [mentorId],
  );
}

export async function insertExperience(
  mentorId: string,
  input: CreateExperienceInput,
): Promise<ExperienceRow> {
  const rows = await query<ExperienceRow>(
    `INSERT INTO mentor_experiences (mentor_id, title, company, location, start_date, end_date, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${EXPERIENCE_COLS}`,
    [
      mentorId,
      input.title,
      input.company ?? null,
      input.location ?? null,
      input.startDate ?? null,
      input.endDate ?? null,
      input.description ?? null,
    ],
  );
  return rows[0]!;
}

export async function updateExperience(
  mentorId: string,
  expId: string,
  patch: UpdateExperienceInput,
): Promise<ExperienceRow | null> {
  const map: Record<string, string> = {
    title: "title",
    company: "company",
    location: "location",
    startDate: "start_date",
    endDate: "end_date",
    description: "description",
  };
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const [key, col] of Object.entries(map)) {
    const val = (patch as Record<string, unknown>)[key];
    if (val !== undefined) {
      params.push(val);
      sets.push(`${col} = $${params.length}`);
    }
  }
  params.push(expId, mentorId);
  const setClause = sets.length ? sets.join(", ") : "title = title";
  const rows = await query<ExperienceRow>(
    `UPDATE mentor_experiences SET ${setClause}
      WHERE id = $${params.length - 1} AND mentor_id = $${params.length}
      RETURNING ${EXPERIENCE_COLS}`,
    params,
  );
  return rows[0] ?? null;
}

export async function deleteExperience(mentorId: string, expId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM mentor_experiences WHERE id = $1 AND mentor_id = $2 RETURNING id`,
    [expId, mentorId],
  );
  return rows.length > 0;
}

// ---- Taxonomy links -----------------------------------------------------

export const countCategories = (ids: string[]) => countIn("categories", ids);
export const countExpertiseTags = (ids: string[]) => countIn("expertise_tags", ids);
export const countLanguages = (ids: string[]) => countIn("languages", ids);

async function countIn(table: string, ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;
  const rows = await query<{ n: number }>(
    `SELECT count(*)::int AS n FROM ${table} WHERE id = ANY($1::uuid[])`,
    [ids],
  );
  return rows[0]?.n ?? 0;
}

/** Replace the full set of links in one table for a mentor (transactional). */
async function replaceLinks(
  table: string,
  column: string,
  mentorId: string,
  ids: string[],
): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(`DELETE FROM ${table} WHERE mentor_id = $1`, [mentorId]);
    if (ids.length > 0) {
      await client.query(
        `INSERT INTO ${table} (mentor_id, ${column}) SELECT $1, unnest($2::uuid[])`,
        [mentorId, ids],
      );
    }
  });
}

export const setMentorCategories = (mentorId: string, ids: string[]) =>
  replaceLinks("mentor_categories", "category_id", mentorId, ids);
export const setMentorExpertise = (mentorId: string, ids: string[]) =>
  replaceLinks("mentor_expertise", "tag_id", mentorId, ids);
export const setMentorLanguages = (mentorId: string, ids: string[]) =>
  replaceLinks("mentor_languages", "language_id", mentorId, ids);

export async function getMentorCategories(mentorId: string): Promise<Category[]> {
  const rows = await query<CategoryRow>(
    `SELECT c.id, c.name, c.slug, c.description, c.icon_url, c.parent_id, c.is_active, c.sort_order, c.created_at
       FROM mentor_categories mc JOIN categories c ON c.id = mc.category_id
      WHERE mc.mentor_id = $1 ORDER BY c.sort_order, c.name`,
    [mentorId],
  );
  return rows.map(toCategory);
}

export async function getMentorExpertise(mentorId: string): Promise<ExpertiseTag[]> {
  const rows = await query<ExpertiseTagRow>(
    `SELECT t.id, t.name, t.slug, t.created_at
       FROM mentor_expertise me JOIN expertise_tags t ON t.id = me.tag_id
      WHERE me.mentor_id = $1 ORDER BY t.name`,
    [mentorId],
  );
  return rows.map(toExpertiseTag);
}

export async function getMentorLanguages(mentorId: string): Promise<Language[]> {
  const rows = await query<LanguageRow>(
    `SELECT l.id, l.code, l.name
       FROM mentor_languages ml JOIN languages l ON l.id = ml.language_id
      WHERE ml.mentor_id = $1 ORDER BY l.name`,
    [mentorId],
  );
  return rows.map(toLanguage);
}

// ---- Search -------------------------------------------------------------

/** Build the shared WHERE clause + params for search + count. */
function buildSearchFilters(q: MentorSearchQuery): { where: string; params: unknown[] } {
  const clauses = [
    `mp.verification_status = 'verified'`,
    `mp.deleted_at IS NULL`,
    `mp.is_accepting_bookings = true`,
  ];
  const params: unknown[] = [];

  if (q.category) {
    params.push(q.category);
    clauses.push(`EXISTS (SELECT 1 FROM mentor_categories mc JOIN categories c ON c.id = mc.category_id
      WHERE mc.mentor_id = mp.id AND c.is_active = true AND (c.slug = $${params.length} OR c.id::text = $${params.length}))`);
  }
  if (q.expertise) {
    params.push(q.expertise);
    clauses.push(`EXISTS (SELECT 1 FROM mentor_expertise me JOIN expertise_tags t ON t.id = me.tag_id
      WHERE me.mentor_id = mp.id AND (t.slug = $${params.length} OR t.id::text = $${params.length}))`);
  }
  if (q.language) {
    params.push(q.language);
    clauses.push(`EXISTS (SELECT 1 FROM mentor_languages ml JOIN languages l ON l.id = ml.language_id
      WHERE ml.mentor_id = mp.id AND (l.code = $${params.length} OR l.id::text = $${params.length}))`);
  }
  if (q.priceMin !== undefined) {
    params.push(q.priceMin);
    clauses.push(`mp.base_session_price >= $${params.length}`);
  }
  if (q.priceMax !== undefined) {
    params.push(q.priceMax);
    clauses.push(`mp.base_session_price <= $${params.length}`);
  }
  if (q.q) {
    params.push(`%${q.q}%`);
    clauses.push(`(u.full_name ILIKE $${params.length} OR mp.designation ILIKE $${params.length} OR mp.bio ILIKE $${params.length})`);
  }
  return { where: clauses.join(" AND "), params };
}

const SORT_SQL: Record<MentorSearchQuery["sort"], string> = {
  rating: "mp.rating_avg DESC, mp.rating_count DESC",
  price_asc: "mp.base_session_price ASC",
  price_desc: "mp.base_session_price DESC",
  experience: "mp.years_of_experience DESC",
};

export async function countSearch(q: MentorSearchQuery): Promise<number> {
  const { where, params } = buildSearchFilters(q);
  const rows = await query<{ n: number }>(
    `SELECT count(*)::int AS n ${PROFILE_FROM} WHERE ${where}`,
    params,
  );
  return rows[0]?.n ?? 0;
}

export async function search(q: MentorSearchQuery): Promise<MentorListRow[]> {
  const { where, params } = buildSearchFilters(q);
  const orderBy = `${SORT_SQL[q.sort]}, mp.created_at DESC`;
  params.push(q.pageSize, offset(q.page, q.pageSize));
  return query<MentorListRow>(
    `SELECT mp.id, u.full_name, u.photo_url, mp.designation, mp.company,
            mp.base_session_price, mp.currency, mp.rating_avg, mp.rating_count, mp.years_of_experience
       ${PROFILE_FROM}
      WHERE ${where}
      ORDER BY ${orderBy}
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
}

/** Top categories per mentor for search cards, fetched in one query. */
export async function categoriesForMentorIds(
  ids: string[],
): Promise<Map<string, { id: string; name: string; slug: string }[]>> {
  const map = new Map<string, { id: string; name: string; slug: string }[]>();
  if (ids.length === 0) return map;
  const rows = await query<{ mentor_id: string; id: string; name: string; slug: string }>(
    `SELECT mc.mentor_id, c.id, c.name, c.slug
       FROM mentor_categories mc JOIN categories c ON c.id = mc.category_id
      WHERE mc.mentor_id = ANY($1::uuid[]) AND c.is_active = true
      ORDER BY c.sort_order, c.name`,
    [ids],
  );
  for (const r of rows) {
    const list = map.get(r.mentor_id) ?? [];
    list.push({ id: r.id, name: r.name, slug: r.slug });
    map.set(r.mentor_id, list);
  }
  return map;
}
