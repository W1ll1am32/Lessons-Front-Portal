import {FC, useEffect, useState} from 'react';
import { Page } from '@/components/Page';
import {Button, Banner, Headline, Pagination, Placeholder, Spinner, Tabbar} from '@telegram-apps/telegram-ui';
import styles from './MyOrdersPage.module.css';
import {useNavigate} from "react-router-dom";
import {Order} from "@/models/Order.ts";
import {getOrders} from "@/api/Orders.ts";
import {initData, useSignal} from "@telegram-apps/sdk-react";
import UserIcon from "@/icons/user.tsx";
import OrdersIcon from "@/icons/orders.tsx";

export const MyOrdersPage: FC = () => {
    const navigate = useNavigate();
    const [IsLoading, SetIsLoading] = useState<boolean>(true);
    const [Error, SetError] = useState<string | null>(null);
    const [LoadOrder, SetNeworders] = useState<Order[]>([]);
    const [currentTabId, setCurrentTab] = useState<string>("orders");
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const initDataRaw = useSignal<string | undefined>(initData.raw);

    const tabs = [
        {
            id: "tutors",
            text: "Репетиторы",
            Icon: UserIcon,
        },
        {
            id: "orders",
            text: "Заказы",
            Icon: OrdersIcon,
        }
    ];

    useEffect(() => {
        const LoadOrders = async () => {
            try {
                if (!initDataRaw) {
                    SetError("Нет токена");
                    return
                }
                const data = await getOrders(initDataRaw, 3, page);
                console.log("Сохраняем заказы в состояние MyOrders:", data);
                if (data == null) {
                    SetNeworders([])
                    setMaxPage(0)
                } else {
                    SetNeworders(data.orders);
                    setMaxPage(data.pages)
                }
            } catch (err) {
                console.log(err);
                SetError("Не получили заказы");
                alert(err)
            } finally {
                SetIsLoading(false);
            }
        };

        LoadOrders();
    }, [page]); // [initDataRaw]

    const HandleAddFunc = () => {
        navigate("/create-order");
    }

    const HandleLinkFunc = (id: string) => {
        navigate(`/order/${id}`);
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    return (
        <Page back={false}>
            <div className={styles.headerContainer}>
                <Headline weight="1">Мои заказы</Headline>
                <Button onClick={HandleAddFunc} mode="filled" size="m">+</Button>
            </div>
            { IsLoading? (
                <Spinner className={styles.spinner} size="l"/>
            ): Error? (
                <div>К сожалению возникла ошибка при загруке страницы. Пожалуйста, попробуйте позже</div>
            ): LoadOrder.length == 0 ? (
                <div className={styles.noOrders}>
                    <Placeholder header="Вы не создали ни одного заказа">
                        <img
                            alt="Telegram sticker"
                            className="blt0jZBzpxuR4oDhJc8s"
                            src="https://xelene.me/telegram.gif"
                        />
                    </Placeholder>
                </div>
            ) : (
                <>
                <div className={styles.orderList}>
                    {LoadOrder.map((order, index) => (
                        <Banner
                            key={index}
                            // after={<Badge type="number">{order.response_count}</Badge>}
                            // before={<Avatar size={48} />}
                            header={order.title}
                            subheader={'Цена мин: ' + order.min_price + ' макс: ' + order.max_price}
                            description={order.description}
                            className={styles.orderItem}
                            // subhead={order.}
                            // subtitle={order.min_price}
                            // titleBadge={order.status == "New" ? <Badge type="dot"/>: <Badge type="dot"/>}
                            onClick={() => HandleLinkFunc(order.id)}
                        >
                            <div className={styles.bannerContent}>
                                {order.tags && order.tags.length > 0 && (
                                    <div className={styles.tagsContainer}>
                                        {order.tags.map((tag, tagIndex) => (
                                            <span key={tagIndex} className={styles.tag}>
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
                                )}
                            </div>
                        </Banner>
                    ))}
                </div>
                <div>
                     <Pagination className={styles.paginationContainer}
                        count={maxPage}
                        page={page}
                        onChange={(_, newPage) => handlePageChange(newPage)} />
                </div>
                </>
            )}
            <Tabbar>
                {tabs.map(({ id, text, Icon }) => (
                    <Tabbar.Item
                        key={id}
                        text={text}
                        selected={id === currentTabId}
                        onClick={() => {
                            setCurrentTab(id);
                            if (id === "tutors") {
                                navigate("/tutors");
                            }
                        }}
                    >
                        <Icon />
                    </Tabbar.Item>
                ))}
            </Tabbar>
        </Page>
    );
};
