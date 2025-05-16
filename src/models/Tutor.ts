export interface Tutor {
    Id: string;
    Tags: string[];
    Rating: number;
    Reviews: Review[];
    Name: string;
    Role: string;
    IsBanned: boolean;
}

export interface Review {
    id: string;
    tutor_id: string;
    is_active: boolean;
    rating: number;
    comment: string;
    created_at: string;
}

export interface TutorDetails {
    Tutor: Tutor;
    Bio: string;
    ResponseCount: number;
    Reviews: Review[];
    IsActive: boolean;
    Tags: string[];
    Rating: number;
    CreatedAt: string;
}

export interface TutorPagination {
    Tutors: Tutor[];
    Pages: number;
}
