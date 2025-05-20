export interface Post {
    id: number,
    titulo: string,
    slug: string,
    extracto: string,
    contenido: string,
    foto_url: string,
    categoria: string,
    categoria_id: number,
    metadescription: string,
    keywords: string,
    created_at: Date,
    updated_at: Date
}

export type PostPartial = Partial<Post>
