export interface Category {
    id: number,
    nombre: string,
    created_at: Date,
    updated_at: Date
}

export type CategoryPartial = Partial<Category>
