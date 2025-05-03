export interface Apiresponse {
    message: string,
    data: any,
    error: string
}

export type ApiresponsePartial = Partial<Apiresponse>
