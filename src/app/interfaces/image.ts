export interface Image {
    id: number,
    nombre: string,
    image_url: string,
    created_at: Date,
    updated_at: Date
}

export type PostPartial = Partial<Image>
