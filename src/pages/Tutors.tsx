import {FC, useEffect, useState} from 'react';
import { Page } from '@/components/Page';
import {Banner, Headline, Pagination, Placeholder, Spinner, Tabbar, Select} from '@telegram-apps/telegram-ui';
import {MultiselectOption} from "@telegram-apps/telegram-ui/dist/components/Form/Multiselect/types";
import styles from './Tutors.module.css';
import {useNavigate} from "react-router-dom";
import {initData, useSignal} from "@telegram-apps/sdk-react";
import {getTutors} from "@/api/Tutors.ts";
import {Tutor} from "@/models/Tutor.ts";
import UserIcon from "@/icons/user.tsx";
import OrdersIcon from "@/icons/orders.tsx";

import text_tags from "./Tags.txt";


export const TutorsPage: FC = () => {
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [IsLoading, SetIsLoading] = useState<boolean>(true);
    const [Error, SetError] = useState<string | null>(null);
    const [LoadTutor, SetTutors] = useState<Tutor[]>([]);
    const [currentTabId, setCurrentTab] = useState<string>("tutors");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [availableTags, setOptions] = useState<MultiselectOption[]>([]);

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
        const fetchTags = async () => {
            try {
                const response = await fetch(text_tags, {
                    headers: {
                        Accept: "text/plain; charset=utf-8",
                    },
                });
                if (!response.ok) {
                    // @ts-ignore
                    throw new Error("Failed to fetch tags.txt");
                }
                const text = await response.text();
                const tags = text
                    .replace(/\r\n/g, "\n")
                    .split("\n\n")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0);
                const fetchedOptions: MultiselectOption[] = tags.map(tag => ({
                    value: tag.toLowerCase().replace(/\s+/g, '_'), // Convert to lowercase and replace spaces with underscores
                    label: tag,
                }));
                setOptions(fetchedOptions);
            } catch (err) {
                console.error("Error fetching tags:", err);
            }
        };

        fetchTags();
    }, []);

    useEffect(() => {
        const LoadTutors = async () => {
            try {
                SetIsLoading(true)
                if (!initDataRaw) {
                    SetError("Нет токена");
                    return
                }
                const data = await getTutors(initDataRaw, 3, page, selectedTag);
                console.log("Туторы:", data);
                if (data == null || data.Tutors == null) {
                    SetTutors([]);
                    setMaxPage(0);
                } else {
                    SetTutors(data.Tutors);
                    setMaxPage(data.Pages);
                }
            } catch (err) {
                console.log(err);
                SetError("Не получили репетиторов");
            } finally {
                SetIsLoading(false);
            }
        };

        LoadTutors();
    }, [page, selectedTag]);

    const handleTagChange = (value: string) => {
        setSelectedTag(value || null);
        setPage(1);
    };

    const HandleLinkFunc = (id: string) => {
        navigate(`/tutor/${id}`);
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    return (
        <Page back={false}>
            <div className={styles.Title}>
                <Headline weight="1"> Репетиторы </Headline>
            </div>
            <div className={styles.tagSelector}>
                <Select
                    className={styles.selectArea}
                    value={selectedTag || ''}
                    onChange={(e) => handleTagChange(e.target.value)}
                >
                    <option value="">Все теги</option>
                    {availableTags.map((tag) => (
                        <option key={tag.value} value={tag.value}>
                            {tag.label}
                        </option>
                    ))}
                </Select>
            </div>
            { IsLoading? (
                <Spinner className={styles.spinner} size="l"/>
            ): Error? (

                <div>К сожалению возникла ошибка при загруке страницы. Пожалуйста, попробуйте позже</div>
            ): LoadTutor.length == 0 ? (
                <div className={styles.noOrders}>
                    <Placeholder header="Не нашли ни одного репетитора">
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
                        {LoadTutor.map((tutor, index) => (
                            <Banner
                                key={index}
                                // before={<Avatar size={48} />}
                                header={tutor.Name}
                                description={<span>
        Рейтинг {tutor.Rating} <span className={styles.star}>★</span>
      </span>}
                                // subhead={order.}
                                // subtitle={order.min_price}
                                // titleBadge={order.status == "New" ? <Badge type="dot"/>: <Badge type="dot"/>}
                                className={styles.orderItem}
                                onClick={() => HandleLinkFunc(tutor.Id)}
                            >
                                <div className={styles.bannerContent}>
                                    {tutor.Tags && tutor.Tags.length > 0 && (
                                        <div className={styles.tagsContainer}>
                                            {tutor.Tags.map((tag, tagIndex) => (
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
                            if (id === "orders") {
                                navigate("/orders");
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
