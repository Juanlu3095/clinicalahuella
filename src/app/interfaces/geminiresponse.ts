export interface Geminiresponse {
    candidates: Array<candidates>,
    modelversion: string,
    usageMetadata: Object
}

interface candidates {
    content: content
}

interface content {
    role: string,
    parts: Array<message>
}

interface message {
    text: string
}

export type GeminiresponsePartial = Partial<Geminiresponse>