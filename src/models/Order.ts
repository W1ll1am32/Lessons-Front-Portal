export interface Order {
    id: string;
    student_id: string;
    title: string;
    description: string;
    tags: string[];
    min_price: number;
    max_price: number;
    status: string;
    response_count: number;
    created_at: string;
    updated_at: string;
}

export interface Responses {
    id: string;
    tutor_id: number;
    name: string;
    is_final: boolean;
    created_at: string;
}

export interface CurrentResponse {
    id: string;
    order_id: string;
    tutor_id: number;
    tutor_username: string;
    name: string;
    greetings: string;
    is_final: boolean;
    created_at: string;
}


export interface OrderDetails {
    id: string;
    name: string;
    student_id: string;
    title: string;
    description: string;
    grade: number;
    min_price: number;
    max_price: number;
    tags: string[];
    status: string;
    response_count: number;
    responses: Responses[];
    created_at: string;
    updated_at: string;
}

export interface OrderCreate {
    name: string;
    title: string;
    description: string;
    grade: string;
    tags: string[];
    min_price: number;
    max_price: number;
}

export interface OrderUpdate {
    title: string;
    description: string;
    tags: string[];
    min_price: number;
    max_price: number;
}


export interface OrderPagination {
    orders: Order[];
    pages: number;
}

export interface Order {}