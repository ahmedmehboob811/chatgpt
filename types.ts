
export enum Role {
    USER = 'user',
    MODEL = 'model',
}

export interface Message {
    role: Role;
    content: string;
}

export interface Chat {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
}
