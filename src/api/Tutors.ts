import {TutorDetails, TutorPagination} from "@/models/Tutor.ts";

const api_link: string = 'https://lessonsmy.tech/api';

export const getTutors = async (userdata: string, limit: number, page: number, tag: string | null): Promise<TutorPagination | null> => {
    try {
        const AuthToken = localStorage.getItem("token");
        if (!AuthToken || !userdata) {
            return null
        }
        let query = ``;
        if (tag) {
            query = `${api_link}/users/pagination?size=${limit}&page=${page}&tag=${tag}`;
        } else {
            query = `${api_link}/users/pagination?size=${limit}&page=${page}`;
        }
        const ResponseOrders = await fetch(query, {
            method: "GET",
            headers: {"Authorization": AuthToken },
        });

        console.log("Response status:", ResponseOrders.status);
        console.log("Response headers:", ResponseOrders.headers);

        if (!ResponseOrders.ok) {
            const errorText = await ResponseOrders.text();
            throw new Error(errorText || 'Не удалось загрузить заказы');
        }
        const data = await ResponseOrders.json();

        console.log("Сохраняем заказы в состояние:", data);
        console.warn(data)
        return data;
    } catch (error) {
        console.error(error);
        return null
    }
}

export const getTutorById = async (id: string, userdata: string): Promise<TutorDetails | null> => {
    try {
        const AuthToken = localStorage.getItem("token");
        if (!AuthToken || !userdata) {
            return null
        }

        const ResponseOrders = await fetch(`${api_link}/users/tutor/id/${id}`, {
            method: "GET",
            headers: {"Authorization": AuthToken },
        });

        console.log("Response status:", ResponseOrders.status);
        console.log("Response headers:", ResponseOrders.headers);

        if (!ResponseOrders.ok) {
            const errorText = await ResponseOrders.text();
            throw new Error(errorText || 'Не удалось загрузить заказы');
        }
        const data = await ResponseOrders.json();
        console.log("Сохраняем заказы в состояние:", data);
        console.warn(data)
        return data || null;
    } catch (error) {
        console.error(error);
        return null
    }
}
