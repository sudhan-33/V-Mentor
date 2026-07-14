import { NotFound } from "../../common/errors.js";
import type { StudentProfile, UpdateStudentProfileInput } from "../../shared/index.js";
import * as repo from "./students.repository.js";

export async function getMyProfile(userId: string): Promise<StudentProfile> {
  const profile = await repo.findByUserId(userId);
  if (!profile) throw NotFound("Student profile not found");
  return profile;
}

export async function updateMyProfile(
  userId: string,
  patch: UpdateStudentProfileInput,
): Promise<StudentProfile> {
  await getMyProfile(userId); // ensure it exists
  await repo.updateByUserId(userId, patch);
  return getMyProfile(userId);
}
