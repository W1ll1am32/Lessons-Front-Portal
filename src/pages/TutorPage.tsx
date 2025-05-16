import {FC, useEffect, useState} from 'react';
import { Page } from '@/components/Page';
import { useParams } from 'react-router-dom';
import {Button, Headline, Modal, Spinner} from '@telegram-apps/telegram-ui';
import { initData, useSignal, mainButton } from '@telegram-apps/sdk-react';
import { TutorDetails } from '@/models/Tutor.ts';
import { getTutorById } from '@/api/Tutors.ts';
import styles from './TutorPage.module.css';
import {getOrders, suggestOrderToTutor} from "@/api/Orders.ts";
import {Order} from "@/models/Order.ts";

export const TutorInfoPage: FC = () => {
    const { id } = useParams<{ id: string }>();
    const initDataRaw = useSignal<string | undefined>(initData.raw);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [tutor, setTutor] = useState<TutorDetails | null>(null);

    const [orders, setOrders] = useState<Order[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [isSuggesting, setIsSuggesting] = useState<boolean>(false);

    useEffect(() => {
        const fetchTutor = async () => {
            if (id) {
                try {
                    if (!initDataRaw) {
                        setError('Нет токена');
                        return;
                    }
                    const tutorData = await getTutorById(id, initDataRaw);
                    if (tutorData) {
                        if (tutorData.Reviews == null) {
                            tutorData.Reviews = [];
                        }
                        if (tutorData.Tags == null) {
                            tutorData.Tags = [];
                        }
                    }
                    setTutor(tutorData);
                } catch (err) {
                    setError('Не удалось получить данные репетитора');
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchTutor();
    }, [id, initDataRaw]);

    useEffect(() => {
        if (!mainButton.isMounted()) {
            mainButton.mount();
        }
        if (!isLoading) {
            if (mainButton.setParams.isAvailable()) {
                mainButton.setParams({
                    text: 'Предложить заказ',
                    // убрать в отдельную проверку!
                    // нужен ли ref?
                    isEnabled: true,//titleRef.current.trim() !== '' && descriptionRef.current.trim() !== '' && tagsRef.current.length > 0, // прикол
                    isVisible: true, // Show only when order is loaded and not responded
                });
            }
        } else {
            mainButton.setParams({
                isVisible: false,
                isEnabled: false,
            });
        }

        const offClick = mainButton.onClick(async () => {
            setIsModalOpen(true);
            fetchNewOrders();
            mainButton.setParams({
                isVisible: false
            });
        });

        return () => {
            offClick();
            mainButton.setParams({
                isVisible: false,
                isEnabled: false,
            });
            console.log("удаляем...");
            mainButton.unmount();
        }
    }, [isLoading, orders]);

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        return (
            <span className={styles.stars}>
        {'★'.repeat(fullStars)}
                {halfStar ? '½' : ''}
                {'☆'.repeat(emptyStars)}
      </span>
        );
    };

    const fetchNewOrders = async () => {
        try {
            if (!initDataRaw) {
                setModalError('Нет токена');
                return;
            }
            const orderData = await getOrders(initDataRaw, 100, 1);
            if (orderData) {
                const filteredOrders = orderData.orders.filter((order) => order.status === 'New');
                setOrders(filteredOrders);
            } else {
                setOrders([]);
            }
        } catch (err) {
            setModalError('Не удалось загрузить заказы');
        }
    };

    // Handle suggesting an order
    const handleSuggestOrder = async (orderId: string) => {
        if (!id || !initDataRaw) {
            setModalError('Ошибка: нет данных репетитора или токена');
            return;
        }
        setIsSuggesting(true);
        try {
            await suggestOrderToTutor(initDataRaw, id, orderId);
            setIsModalOpen(false); // Close modal on success
            alert('Заказ успешно предложен репетитору!');
        } catch (err) {
            setModalError('Не удалось предложить заказ');
        } finally {
            setIsSuggesting(false);
        }
    };

    return (
        <Page back={true}>
            <div className={styles.container}>
                {error ? (
                    <div>Извините, возникла ошибка: {error}</div>
                ) : isLoading ? (
                    <Spinner className={styles.spinner} size="l" />
                ) : !tutor ? (
                    <Headline weight="1">Репетитор не найден</Headline>
                ) : (
                    <>
                        <Headline weight="2" className={styles.centeredHeadline}>
                            Профиль репетитора
                        </Headline>
                        <div className={styles.tutorInfo}>
                            <p className={styles.statusText}>{tutor.Tutor.Name}</p>
                            <p className={styles.rating}>
                                {renderStars(tutor.Rating)} {tutor.Rating} ({tutor.Reviews.length} отзывов)
                            </p>
                        </div>
                        <div className={styles.tags}>
                            {tutor.Tags.map((tag, index) => (
                                <span key={index} className={styles.tag}>
                {tag
                    .replace(/_/g, ' ') // Replace underscores with spaces
                    .split(' ') // Split into words
                    .map((word, index) =>
                        index === 0
                            ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                            : word.toLowerCase()
                    ) // Capitalize first letter of first word, lowercase others
                    .join(' ')}
            </span>
                            ))}
                        </div>
                        <div className={styles.orderDetails}>
                            <p>Описание: {tutor.Bio}</p>
                        </div>
                        <div className={styles.reviews}>
                            <Headline weight="3">Отзывы</Headline>
                            {tutor.Reviews.length === 0 ? (
                                <p>Отзывов пока нет</p>
                            ) : (
                                tutor.Reviews.map((review) => (
                                    <div key={review.id} className={styles.review}>
                                        <p className={styles.reviewRating}>
                                            {renderStars(review.rating)}
                                        </p>
                                        <p className={styles.reviewComment}>{review.comment}</p>
                                        <p className={styles.reviewDate}>
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
            <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
                <div className={styles.modalHeader}>
                    <Headline weight="1">Выберите заказ</Headline>
                </div>
                <div>
                    {modalError ? (
                        <div>Ошибка: {modalError}</div>
                    ) : orders.length === 0 ? (
                        <p>Нет доступных заказов со статусом "New"</p>
                    ) : (
                        <div className={styles.orderList}>
                            {orders.map((order) => (
                                <div key={order.id} className={styles.orderItem}>
                                    <p><strong>{order.title}</strong></p>
                                    <p>{order.description}</p>
                                    <p>Цена: {order.min_price} - {order.max_price}</p>
                                    <Button
                                        mode="filled"
                                        size="s"
                                        disabled={isSuggesting}
                                        onClick={() => handleSuggestOrder(order.id)}
                                    >
                                        {isSuggesting ? 'Предлагается...' : 'Предложить'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </Page>
    );
};