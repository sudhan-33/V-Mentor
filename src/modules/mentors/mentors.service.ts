import { BadRequest, NotFound } from "../../common/errors.js";
import { paginate } from "../../common/pagination.js";
import type {
  CreateExperienceInput,
  Category,
  ExpertiseTag,
  Language,
  MentorDetail,
  MentorExperience,
  MentorListItem,
  MentorProfile,
  MentorSearchQuery,
  PaginatedResult,
  UpdateExperienceInput,
  UpdateMentorProfileInput,
  VerifyMentorInput,
} from "../../shared/index.js";
import * as repo from "./mentors.repository.js";
import {
  toMentorExperience,
  toMentorListItem,
  toMentorProfile,
  type MentorProfileRow,
} from "./mentors.types.js";

/** Resolve the caller's mentor profile row or 404. */
async function requireOwnProfile(userId: string): Promise<MentorProfileRow> {
  const row = await repo.findProfileByUserId(userId);
  if (!row) throw NotFound("Mentor profile not found");
  return row;
}

async function buildDetail(row: MentorProfileRow): Promise<MentorDetail> {
  const [experiences, categories, expertise, languages] = await Promise.all([
    repo.listExperiences(row.id),
    repo.getMentorCategories(row.id),
    repo.getMentorExpertise(row.id),
    repo.getMentorLanguages(row.id),
  ]);
  return {
    ...toMentorProfile(row),
    experiences: experiences.map(toMentorExperience),
    categories,
    expertise,
    languages,
  };
}

// ---- Self ---------------------------------------------------------------

export async function getMyProfile(userId: string): Promise<MentorDetail> {
  return buildDetail(await requireOwnProfile(userId));
}

export async function updateMyProfile(
  userId: string,
  patch: UpdateMentorProfileInput,
): Promise<MentorDetail> {
  await requireOwnProfile(userId);
  await repo.updateProfileByUserId(userId, patch);
  return buildDetail(await requireOwnProfile(userId));
}

export async function addExperience(
  userId: string,
  input: CreateExperienceInput,
): Promise<MentorExperience> {
  const { id } = await requireOwnProfile(userId);
  return toMentorExperience(await repo.insertExperience(id, input));
}

export async function updateExperience(
  userId: string,
  expId: string,
  patch: UpdateExperienceInput,
): Promise<MentorExperience> {
  const { id } = await requireOwnProfile(userId);
  const row = await repo.updateExperience(id, expId, patch);
  if (!row) throw NotFound("Experience not found");
  return toMentorExperience(row);
}

export async function deleteExperience(userId: string, expId: string): Promise<void> {
  const { id } = await requireOwnProfile(userId);
  if (!(await repo.deleteExperience(id, expId))) throw NotFound("Experience not found");
}

export async function setCategories(userId: string, ids: string[]): Promise<Category[]> {
  const { id } = await requireOwnProfile(userId);
  const unique = [...new Set(ids)];
  if ((await repo.countCategories(unique)) !== unique.length) {
    throw BadRequest("One or more category ids are invalid");
  }
  await repo.setMentorCategories(id, unique);
  return repo.getMentorCategories(id);
}

export async function setExpertise(userId: string, ids: string[]): Promise<ExpertiseTag[]> {
  const { id } = await requireOwnProfile(userId);
  const unique = [...new Set(ids)];
  if ((await repo.countExpertiseTags(unique)) !== unique.length) {
    throw BadRequest("One or more expertise tag ids are invalid");
  }
  await repo.setMentorExpertise(id, unique);
  return repo.getMentorExpertise(id);
}

export async function setLanguages(userId: string, ids: string[]): Promise<Language[]> {
  const { id } = await requireOwnProfile(userId);
  const unique = [...new Set(ids)];
  if ((await repo.countLanguages(unique)) !== unique.length) {
    throw BadRequest("One or more language ids are invalid");
  }
  await repo.setMentorLanguages(id, unique);
  return repo.getMentorLanguages(id);
}

// ---- Public -------------------------------------------------------------

export async function searchMentors(
  q: MentorSearchQuery,
): Promise<PaginatedResult<MentorListItem>> {
  const [rows, total] = await Promise.all([repo.search(q), repo.countSearch(q)]);
  const catMap = await repo.categoriesForMentorIds(rows.map((r) => r.id));
  const items = rows.map((r) => toMentorListItem(r, catMap.get(r.id) ?? []));
  return paginate(items, total, q.page, q.pageSize);
}

export async function getMentorById(id: string): Promise<MentorDetail> {
  const row = await repo.findVerifiedProfileById(id);
  if (!row) throw NotFound("Mentor not found");
  return buildDetail(row);
}

// ---- Admin --------------------------------------------------------------

export async function listPending(): Promise<MentorProfile[]> {
  return (await repo.listPendingProfiles()).map(toMentorProfile);
}

export async function verifyMentor(
  mentorId: string,
  input: VerifyMentorInput,
): Promise<MentorProfile> {
  const row = await repo.setVerificationStatus(mentorId, input.status);
  if (!row) throw NotFound("Mentor not found");
  return toMentorProfile(row);
}
