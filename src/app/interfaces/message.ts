export interface Message {
    id: string,
    nombre: string,
    apellidos: string,
    email: string,
    telefono: number,
    asunto: string,
    mensaje: string,
    created_at: Date,
    updated_at: Date
}

export type MessagePartial = Partial<Message>
