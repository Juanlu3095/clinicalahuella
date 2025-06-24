export interface Appointment {
    id: string,
    nombre: string,
    apellidos: string,
    email: string,
    telefono: string,
    fecha: string,
    hora: string,
    created_at: Date,
    updated_at: Date
}

export type AppointmentPartial = Partial<Appointment>
