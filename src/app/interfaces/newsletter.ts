export interface Newsletter {
    id: string,
    email: string,
    created_at: Date,
    updated_at: Date
}

export type NewsletterOptional = Partial<Newsletter>
