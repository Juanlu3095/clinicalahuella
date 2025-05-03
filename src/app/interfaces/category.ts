export interface Category {
    id: number,
    nombre: string,
    created_at: Date|string,
    updated_at: Date|string
}

export type CategoryPartial = Partial<Category>
