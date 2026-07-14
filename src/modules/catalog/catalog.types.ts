import type { Category, ExpertiseTag, Language } from "../../shared/index.js";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface ExpertiseTagRow {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface LanguageRow {
  id: string;
  code: string;
  name: string;
}

export const toCategory = (r: CategoryRow): Category => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  description: r.description,
  iconUrl: r.icon_url,
  parentId: r.parent_id,
  isActive: r.is_active,
  sortOrder: r.sort_order,
  createdAt: r.created_at,
});

export const toExpertiseTag = (r: ExpertiseTagRow): ExpertiseTag => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  createdAt: r.created_at,
});

export const toLanguage = (r: LanguageRow): Language => ({
  id: r.id,
  code: r.code,
  name: r.name,
});
