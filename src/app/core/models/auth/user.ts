export interface User {
    email: string;
    username: string;
    token: string;
    email_verified_at: string|null;
    is_approved: string|null;
    image: string|null;

    first_name: string|null;
    last_name: string|null;

    date_of_birth: string|null;

    address_line_1: string|null;
    city: string|null;
    state: string|null;

    postal_code: string|null;
    country_code: string|null;   
}