import { FC, useEffect, useRef, useState } from 'react';
import { Page } from '@/components/Page.tsx';
import {
    List,
    Input,
    Textarea,
    Headline,
    Multiselect,
    Select
} from '@telegram-apps/telegram-ui';
import { initData, mainButton, useSignal } from "@telegram-apps/sdk-react";
import { OrderCreate } from "@/models/Order.ts";
import { createOrder } from "@/api/Orders.ts";
import { useNavigate } from "react-router-dom";
import { MultiselectOption } from "@telegram-apps/telegram-ui/dist/components/Form/Multiselect/types";
import styles from "./CreateOrderPage.module.css";

import text_tags from "./Tags.txt";

const classOptions = [
    { value: '1', label: '1 класс' },
    { value: '2', label: '2 класс' },
    { value: '3', label: '3 класс' },
    { value: '4', label: '4 класс' },
    { value: '5', label: '5 класс' },
    { value: '6', label: '6 класс' },
    { value: '7', label: '7 класс' },
    { value: '8', label: '8 класс' },
    { value: '9', label: '9 класс' },
    { value: '10', label: '10 класс' },
    { value: '11', label: '11 класс' },
    { value: '1_course', label: '1 курс' },
    { value: '2_course', label: '2 курс' },
    { value: '3_course', label: '3 курс' },
    { value: '4_course', label: '4 курс' },
];

export const CreateOrderPage: FC = () => {
    const [selectedValues, setSelectedValues] = useState<MultiselectOption[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [name, setName] = useState<string>('Аноним');
    const [title, setTitle] = useState<string>('');
    const [grade, setGrade] = useState<string>('1');
    const [description, setDescription] = useState<string>('');
    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(1000);
    const [priceError, setPriceError] = useState<string>('');
    const [nameError, setNameError] = useState<string>('');
    const [titleError, setTitleError] = useState<string>('');
    const [descriptionError, setDescriptionError] = useState<string>('');
    const [tagsError, setTagsError] = useState<string>(''); // New state for tags error
    const [options, setOptions] = useState<MultiselectOption[]>([]);

    const initDataRaw = useSignal<string | undefined>(initData.raw);

    const nameRef = useRef(name);
    const titleRef = useRef(title);
    const descriptionRef = useRef(description);
    const gradeRef = useRef(grade);
    const tagsRef = useRef(tags);
    const minPriceRef = useRef(minPrice);
    const maxPriceRef = useRef(maxPrice);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch(text_tags, {
                    headers: {
                        Accept: "text/plain; charset=utf-8",
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch tags.txt");
                }
                const text = await response.text();
                const tagsArray = text
                    .replace(/\r\n/g, "\n")
                    .split("\n\n")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0);
                const fetchedOptions: MultiselectOption[] = tagsArray.map(tag => ({
                    value: tag.toLowerCase().replace(/\s+/g, '_'),
                    label: tag,
                }));
                console.log('Fetched:', fetchedOptions);
                setOptions(fetchedOptions);
            } catch (error) {
                console.error('Error fetching tags:', error);
                setOptions([
                    { value: 'cpp', label: 'C++' },
                    { value: 'python', label: 'Python' },
                ]);
            }
        };

        fetchTags();
    }, []);

    const handleSelect = (selectedOptions: MultiselectOption[]) => {
        if (selectedOptions.length > 3) {
            setTagsError('Можно выбрать не более 3 тегов');
            return;
        }
        setTagsError('');
        setSelectedValues(selectedOptions);
        setTags(selectedOptions.map(option => String(option.value)));
    };

    const handlePriceChange = (type: 'min' | 'max', value: string) => {
        const numValue = Number(value);

        if (isNaN(numValue)) {
            setPriceError('Введите числовое значение');
            return;
        }

        if (numValue < 0) {
            setPriceError('Цена не может быть отрицательной');
            return;
        }

        setPriceError('');

        if (type === 'min') {
            setMinPrice(numValue);
            if (numValue > maxPrice) {
                setMaxPrice(numValue);
            }
        } else {
            setMaxPrice(numValue);
            if (numValue < minPrice) {
                setMinPrice(numValue);
            }
        }
    };

    useEffect(() => {
        nameRef.current = name;
        titleRef.current = title;
        descriptionRef.current = description;
        gradeRef.current = grade;
        tagsRef.current = tags;
        minPriceRef.current = minPrice;
        maxPriceRef.current = maxPrice;
    }, [name, title, description, grade, tags, minPrice, maxPrice]);

    useEffect(() => {
        if (!mainButton.isMounted()) {
            mainButton.mount();
        }
        if (mainButton.setParams.isAvailable()) {
            mainButton.setParams({
                text: 'Создать',
                isEnabled: true,
                isVisible: true
            });
        }

        const offClick = mainButton.onClick(async () => {
            // Reset errors
            setNameError('');
            setTitleError('');
            setDescriptionError('');
            setTagsError('');

            // Validate fields
            let hasError = false;

            if (nameRef.current.trim().length < 2) {
                setNameError('Имя должно содержать не менее 2 символов');
                hasError = true;
            }

            if (titleRef.current.trim().length < 5) {
                setTitleError('Название должно содержать не менее 5 символов');
                hasError = true;
            }

            if (descriptionRef.current.trim().length < 10) {
                setDescriptionError('Описание должно содержать не менее 10 символов');
                hasError = true;
            }

            if (tagsRef.current.length === 0) {
                setTagsError('Выберите хотя бы один тег');
                hasError = true;
            } else if (tagsRef.current.length > 3) {
                setTagsError('Можно выбрать не более 3 тегов');
                hasError = true;
            }

            if (nameRef.current.trim() === '' ||
                titleRef.current.trim() === '' ||
                descriptionRef.current.trim() === '') {
                alert('Заполните все обязательные поля');
                hasError = true;
            }

            if (priceError) {
                alert(priceError);
                hasError = true;
            }

            if (hasError) {
                return;
            }

            mainButton.setParams({
                isLoaderVisible: true,
                isEnabled: false
            });

            const orderData: OrderCreate = {
                name: nameRef.current,
                title: titleRef.current,
                description: descriptionRef.current,
                grade: gradeRef.current,
                tags: tagsRef.current,
                min_price: minPriceRef.current,
                max_price: maxPriceRef.current
            };

            if (!initDataRaw) {
                alert('Ошибка инициализации данных. Попробуйте позже');
                return;
            }

            try {
                const orderId = await createOrder(orderData, initDataRaw);
                alert('Заказ создан! ID: ' + orderId);
                navigate(`/orders`);
            } catch (error) {
                alert('Ошибка создания заказа');
            } finally {
                mainButton.setParams({ isLoaderVisible: false, isEnabled: true });
            }
        });

        return () => {
            offClick();
            mainButton.setParams({
                isVisible: false,
                isEnabled: false,
            });
            mainButton.unmount();
        }
    }, []);

    return (
        <Page>
            <List>
                <Headline weight="2" style={{ marginBottom: '8px', marginTop: '16px' }}>
                    Введите название заказа
                </Headline>
                <Input
                    header="Название"
                    status="focused"
                    placeholder="Дискретная математика/Алгебра логики/..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                {titleError && (
                    <div style={{ color: 'red', marginTop: '8px' }}>
                        {titleError}
                    </div>
                )}
                <Headline weight="2" style={{ marginBottom: '8px', marginTop: '16px' }}>
                    Опишите задачу
                </Headline>
                <Textarea
                    header="Описание"
                    status="focused"
                    placeholder="Я хочу сделать ..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                {descriptionError && (
                    <div style={{ color: 'red', marginTop: '8px' }}>
                        {descriptionError}
                    </div>
                )}
                <Headline weight="2" style={{ marginBottom: '8px', marginTop: '16px' }}>
                    Класс/Курс
                </Headline>
                <Select
                    className={styles.selectArea}
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                >
                    {classOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Select>
                <Headline weight="2" style={{ marginBottom: '8px' }}>
                    Ваше имя
                </Headline>
                <Input
                    header="Имя"
                    status="focused"
                    placeholder="Введите ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                {nameError && (
                    <div style={{ color: 'red', marginTop: '8px' }}>
                        {nameError}
                    </div>
                )}
                <Headline weight="2" style={{ marginBottom: '8px', marginTop: '16px' }}>
                    Предметы
                </Headline>
                <Multiselect
                    closeDropdownAfterSelect={true}
                    options={options}
                    value={selectedValues}
                    onChange={handleSelect}
                />
                {tagsError && (
                    <div style={{ color: 'red', marginTop: '8px' }}>
                        {tagsError}
                    </div>
                )}
                <Headline weight="2" style={{ marginBottom: '8px', marginTop: '16px' }}>
                    Укажите цену заказа
                </Headline>
                <Input
                    header="Минимальная цена (₽)"
                    type="number"
                    value={minPrice.toString()}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                />
                <Input
                    header="Максимальная цена (₽)"
                    type="number"
                    value={maxPrice.toString()}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                />
                {priceError && (
                    <div style={{ color: 'red', marginTop: '8px' }}>
                        {priceError}
                    </div>
                )}
            </List>
        </Page>
    );
};