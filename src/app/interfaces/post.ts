export interface Post {
    id: number,
    titulo: string,
    slug: string,
    extracto: string,
    contenido: string,
    imagen: string | null, // La imagen que se sube al backend
    categoria: string,
    categoria_id: number | null,
    metadescription: string,
    keywords: string,
    created_at: Date,
    updated_at: Date
}

export type PostPartial = Partial<Post>
