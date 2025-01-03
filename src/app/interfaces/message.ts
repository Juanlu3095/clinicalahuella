export interface Message {
    id: string,
    nombre: string,
    apellidos: string,
    email: string,
    telefono: number,
    asunto: string,
    mensaje: string
}

export type MessageOptional = Partial<Message>
