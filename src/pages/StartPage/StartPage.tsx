import { useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { initData, useSignal } from '@telegram-apps/sdk-react';
import {ValidateInitData} from "@/api/Auth.ts";
// import { ValidateInitData } from '@/api/auth';

export const StartPage: FC = () => {
    const initDataRaw = useSignal<string | undefined>(initData.raw);
    const navigate = useNavigate();

    useEffect(() => {
        const authenticate = async () => {
            if (!initDataRaw) {
                alert('Ошибка авторизации.');
                return;
            }
            try {
                // navigate('/orders');
                // Класть init data куда-то?
                const request_status = await ValidateInitData(initDataRaw);
                if (request_status) {
                    navigate('/orders');
                } else {
                    console.error('Authorization failed');
                    alert('Не удалось выполнить авторизацию.');
                }
            } catch (error) {
                console.error('Authorization failed:', error);
                alert('Не удалось выполнить авторизацию.');
            }
        };

        authenticate();
    }, [initDataRaw, navigate]);

    // return <Spinner className={styles.spinner} size="l"/>
    return <p style={{
        fontFamily: 'Arial, sans-serif', // Your desired font
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Full viewport height
        margin: 0, // Remove default margin
        textAlign: 'center' }}>Проверка авторизации...</p>;
};