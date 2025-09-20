export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  chapterPrice: number;
  thumbnailUrl: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface Chapter {
  id: string;
  title: string;
  slug: string;
  order: number;
  public: boolean;
  excerpt: string;
  contentHtml: string;
}

export interface CartItem {
  itemId: string;
  itemType: "course" | "chapter";
  price: number;
}
