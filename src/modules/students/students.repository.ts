import { query } from "../../config/db.js";
import type { StudentProfile, UpdateStudentProfileInput } from "../../shared/index.js";

interface StudentProfileRow {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  photo_url: string | null;
  headline: string | null;
  goals: string | null;
  interests: string | null;
}

const toStudentProfile = (r: StudentProfileRow): StudentProfile => ({
  id: r.id,
  userId: r.user_id,
  fullName: r.full_name,
  email: r.email,
  photoUrl: r.photo_url,
  headline: r.headline,
  goals: r.goals,
  interests: r.interests,
});

const SELECT = `
  SELECT sp.id, sp.user_id, u.full_name, u.email, u.photo_url,
         sp.headline, sp.goals, sp.interests
    FROM student_profiles sp JOIN users u ON u.id = sp.user_id`;

export async function findByUserId(userId: string): Promise<StudentProfile | null> {
  const rows = await query<StudentProfileRow>(`${SELECT} WHERE sp.user_id = $1`, [userId]);
  return rows[0] ? toStudentProfile(rows[0]) : null;
}

export async function updateByUserId(
  userId: string,
  patch: UpdateStudentProfileInput,
): Promise<void> {
  const map: Record<string, string> = {
    headline: "headline",
    goals: "goals",
    interests: "interests",
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
    `UPDATE student_profiles SET ${sets.join(", ")} WHERE user_id = $${params.length}`,
    params,
  );
}
