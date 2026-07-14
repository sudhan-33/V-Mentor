import { query } from "../../config/db.js";
import type {
  CreateCategoryInput,
  CreateExpertiseTagInput,
  CreateLanguageInput,
  UpdateCategoryInput,
} from "../../shared/index.js";
import type { CategoryRow, ExpertiseTagRow, LanguageRow } from "./catalog.types.js";

const CATEGORY_COLS = `id, name, slug, description, icon_url, parent_id, is_active, sort_order, created_at`;

// ---- Categories ---------------------------------------------------------

export async function listCategories(activeOnly: boolean): Promise<CategoryRow[]> {
  const where = activeOnly ? "WHERE is_active = true" : "";
  return query<CategoryRow>(
    `SELECT ${CATEGORY_COLS} FROM categories ${where} ORDER BY sort_order, name`,
  );
}

export async function findCategoryById(id: string): Promise<CategoryRow | null> {
  const rows = await query<CategoryRow>(
    `SELECT ${CATEGORY_COLS} FROM categories WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  const rows = await query<CategoryRow>(
    `SELECT ${CATEGORY_COLS} FROM categories WHERE slug = $1`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function insertCategory(input: CreateCategoryInput): Promise<CategoryRow> {
  const rows = await query<CategoryRow>(
    `INSERT INTO categories (name, slug, description, icon_url, parent_id, sort_order)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, 0))
     RETURNING ${CATEGORY_COLS}`,
    [
      input.name,
      input.slug,
      input.description ?? null,
      input.iconUrl ?? null,
      input.parentId ?? null,
      input.sortOrder ?? null,
    ],
  );
  return rows[0]!;
}

/** Partial update — only the provided fields are changed. */
export async function updateCategory(
  id: string,
  patch: UpdateCategoryInput,
): Promise<CategoryRow | null> {
  const map: Record<string, string> = {
    name: "name",
    slug: "slug",
    description: "description",
    iconUrl: "icon_url",
    parentId: "parent_id",
    sortOrder: "sort_order",
    isActive: "is_active",
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
  if (sets.length === 0) return findCategoryById(id);

  params.push(id);
  const rows = await query<CategoryRow>(
    `UPDATE categories SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING ${CATEGORY_COLS}`,
    params,
  );
  return rows[0] ?? null;
}

export async function deactivateCategory(id: string): Promise<CategoryRow | null> {
  const rows = await query<CategoryRow>(
    `UPDATE categories SET is_active = false WHERE id = $1 RETURNING ${CATEGORY_COLS}`,
    [id],
  );
  return rows[0] ?? null;
}

// ---- Expertise tags -----------------------------------------------------

export async function listExpertiseTags(q?: string): Promise<ExpertiseTagRow[]> {
  if (q) {
    return query<ExpertiseTagRow>(
      `SELECT id, name, slug, created_at FROM expertise_tags
        WHERE name ILIKE $1 OR slug ILIKE $1 ORDER BY name`,
      [`%${q}%`],
    );
  }
  return query<ExpertiseTagRow>(
    `SELECT id, name, slug, created_at FROM expertise_tags ORDER BY name`,
  );
}

export async function findExpertiseTagBySlug(slug: string): Promise<ExpertiseTagRow | null> {
  const rows = await query<ExpertiseTagRow>(
    `SELECT id, name, slug, created_at FROM expertise_tags WHERE slug = $1`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function insertExpertiseTag(
  input: CreateExpertiseTagInput,
): Promise<ExpertiseTagRow> {
  const rows = await query<ExpertiseTagRow>(
    `INSERT INTO expertise_tags (name, slug) VALUES ($1, $2)
     RETURNING id, name, slug, created_at`,
    [input.name, input.slug],
  );
  return rows[0]!;
}

export async function deleteExpertiseTag(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM expertise_tags WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows.length > 0;
}

// ---- Languages ----------------------------------------------------------

export async function listLanguages(): Promise<LanguageRow[]> {
  return query<LanguageRow>(`SELECT id, code, name FROM languages ORDER BY name`);
}

export async function findLanguageByCode(code: string): Promise<LanguageRow | null> {
  const rows = await query<LanguageRow>(
    `SELECT id, code, name FROM languages WHERE code = $1`,
    [code],
  );
  return rows[0] ?? null;
}

export async function insertLanguage(input: CreateLanguageInput): Promise<LanguageRow> {
  const rows = await query<LanguageRow>(
    `INSERT INTO languages (code, name) VALUES ($1, $2) RETURNING id, code, name`,
    [input.code, input.name],
  );
  return rows[0]!;
}
