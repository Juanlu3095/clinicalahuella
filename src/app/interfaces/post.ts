export interface Post {
    id: number,
    titulo: string,
    slug: string,
    extracto: string,
    contenido: string,
    foto_url: string,
    categoria: string,
    created_at: Date,
    updated_at: Date
}

export type PostOptional = Partial<Post>
