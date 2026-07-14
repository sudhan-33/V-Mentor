/** Discovery taxonomy — categories, expertise tags, languages. */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface ExpertiseTag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Language {
  id: string;
  code: string;
  name: string;
}
