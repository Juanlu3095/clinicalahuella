export interface Apiresponse {
    message: string,
    data: any,
    error: string
}

export type ApiresponseOptional = Partial<Apiresponse>
