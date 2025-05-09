'use client';

import React, { useState, forwardRef } from 'react';
import Select, { StylesConfig, SingleValue } from 'react-select';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import { ko } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";
import AppPageLayout from '@/app/components/AppPageLayout';
import { getDaysInMonth } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';

registerLocale('ko', ko);

const exchangeOptions = [
    { value: 'bithumb', label: '빗썸' },
    { value: 'upbit', label: '업비트' }
];

const coinOptions = [
    { value: 'BTC', label: '비트코인' },
    { value: 'ETH', label: '이더리움' },
    { value: 'XRP', label: '리플' },
    { value: 'SOL', label: '솔라나' }
];

// 주식 옵션 배열 추가
const stockOptions: OptionType[] = [
    { value: 'AAPL', label: '애플 (AAPL)' },
    { value: 'GOOGL', label: '구글 (GOOGL)' },
    { value: 'TSLA', label: '테슬라 (TSLA)' },
    { value: 'AMZN', label: '아마존 (AMZN)' }
];

// 자산 유형 옵션 추가
const assetTypeOptions: OptionType[] = [
    { value: 'coin', label: '코인' },
    { value: 'stock', label: '주식' }
];

// 주간 옵션 (요일)
const weeklyOptions: OptionType[] = [
    { value: 'SUN', label: '일요일' },
    { value: 'MON', label: '월요일' },
    { value: 'TUE', label: '화요일' },
    { value: 'WED', label: '수요일' },
    { value: 'THU', label: '목요일' },
    { value: 'FRI', label: '금요일' },
    { value: 'SAT', label: '토요일' }
];

interface OptionType {
    readonly value: string;
    readonly label: string;
}

export default function AddPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true';

    // 자산 유형(코인/주식) 상태
    const [assetType, setAssetType] = useState<OptionType>(assetTypeOptions[0]);

    // 시간 선택 기본값을 다음 15분 단위로 설정하는 헬퍼
    const getNearestQuarter = () => {
        const now = new Date();
        const minutes = now.getMinutes();
        const nextQuarter = Math.ceil(minutes / 15) * 15;
        if (nextQuarter === 60) {
            now.setHours(now.getHours() + 1);
            now.setMinutes(0);
        } else {
            now.setMinutes(nextQuarter);
        }
        now.setSeconds(0);
        now.setMilliseconds(0);
        return now;
    };

    const [formData, setFormData] = useState({
        exchange: exchangeOptions[0],
        coin: coinOptions[0],
        price: '',
        time: getNearestQuarter(),
        frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
        dayOfWeek: null as OptionType | null,
        dayOfMonth: ''
    });

    const handleSubmit = () => {
        console.log('코인 모으기 설정:', {
            exchange: formData.exchange.value,
            coin: formData.coin.value,
            price: formData.price,
            time: formData.time
        });
    };

    const selectStyles: StylesConfig<OptionType, false> = {
        control: (base) => ({
            ...base,
            backgroundColor: 'var(--secondary-bg-color)',
            borderColor: 'var(--input-border-color)',
            borderRadius: '12px',
            padding: '4px',
            '&:hover': {
                borderColor: 'var(--accent-color)'
            },
            boxShadow: 'none',
            minHeight: '48px'
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? 'var(--accent-color)' : 'var(--secondary-bg-color)',
            color: 'var(--text-color)',
            '&:hover': {
                backgroundColor: state.isSelected ? 'var(--accent-color)' : '#2D3748'
            }
        }),
        singleValue: (base) => ({
            ...base,
            color: 'var(--text-color)'
        }),
        input: (base) => ({
            ...base,
            color: 'var(--text-color)'
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: 'var(--secondary-bg-color)',
            border: '1px solid var(--input-border-color)',
            borderRadius: '12px'
        })
    };

    // 커스텀 입력 컴포넌트 (읽기 전용) - 클릭으로만 열림
    const TimeInput = forwardRef<HTMLInputElement, { value?: string; onClick?: () => void }>(
        ({ value, onClick }, ref) => (
            <input
                ref={ref}
                value={value}
                onClick={onClick}
                readOnly
                className="inline-block w-auto h-10 px-4 leading-[2.5rem] text-center bg-[var(--secondary-bg-color)] border border-[var(--input-border-color)] rounded-xl text-white focus:outline-none focus:border-[var(--accent-color)]"
            />
        )
    );
    TimeInput.displayName = 'TimeInput';

    const isFormValid = formData.price !== '' && (
        formData.frequency === 'daily' ||
        (formData.frequency === 'weekly' && formData.dayOfWeek !== null) ||
        (formData.frequency === 'monthly' && formData.dayOfMonth !== '')
    );

    // 가격 형변환 및 유효성 검사: 5,000원 이하일 때 경고 표시
    const numericPrice = Number(formData.price.replace(/[^0-9]/g, ''));
    const isPriceTooLow = formData.price !== '' && numericPrice < 5000;

    return (
        <AppPageLayout>
                    <div className="w-full">
                        <div className="flex items-center justify-between mt-4 mb-8">
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const other = assetTypeOptions.find(opt => opt.value !== assetType.value);
                                        if (other) {
                                            setAssetType(other);
                                            // 자산 유형 변경 시 기본 선택값 초기화
                                            setFormData(prev => ({
                                                ...prev,
                                                coin: other.value === 'coin' ? coinOptions[0] : stockOptions[0]
                                            }));
                                        }
                                    }}
                                    className="flex items-center text-2xl font-bold text-white border-b-2 border-white pb-1"
                                >
                                    {assetType.label}
                                    <svg className="w-5 h-5 ml-1 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <span className="text-2xl font-bold text-white">모으기</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => router.push('/dca')}
                                className="bg-[var(--secondary-bg-color)] p-2 rounded-full"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit();
                        }} className="space-y-6">
                            {/* 거래소 선택: 코인일 때만 노출 */}
                            {assetType.value === 'coin' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    어느 거래소에서 모을까요?
                                </label>
                                <Select
                                    value={formData.exchange}
                                    onChange={(option: SingleValue<OptionType>) => 
                                        option && setFormData(prev => ({ ...prev, exchange: option }))}
                                    isDisabled={isEditMode}
                                    options={exchangeOptions}
                                    styles={selectStyles}
                                    isSearchable={false}
                                />
                            </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {assetType.value === 'coin' ? '어떤 코인을 모을까요?' : '어떤 주식을 모을까요?'}
                                </label>
                                <Select
                                    value={formData.coin}
                                    onChange={(option: SingleValue<OptionType>) => 
                                        option && setFormData(prev => ({ ...prev, coin: option }))}
                                    options={assetType.value === 'coin' ? coinOptions : stockOptions}
                                    styles={selectStyles}
                                    isDisabled={isEditMode}
                                    isSearchable={false}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    얼마씩 모을까요?
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={formData.price}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/[^0-9]/g, '');
                                            const formatted = raw ? Number(raw).toLocaleString() : '';
                                            setFormData(prev => ({ ...prev, price: formatted }));
                                        }}
                                        placeholder="최소 5,000원부터 모을 수 있어요"
                                        className="appearance-none w-full px-4 py-3 bg-[var(--secondary-bg-color)] border border-[var(--input-border-color)] rounded-xl text-right pr-16 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent-color)]"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        KRW
                                    </span>
                                </div>
                                {isPriceTooLow && (
                                    <p className="mt-1 text-sm text-red-500">최소 5,000원 이상이어야 해요</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    언제 모을까요?
                                </label>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <button
                                        type="button"
                                        className={`px-4 py-2 rounded-xl text-white transition-colors ${formData.frequency==='daily'? 'bg-[var(--accent-color)]':'bg-[var(--secondary-bg-color)]'}`}
                                        onClick={() => setFormData(prev => ({ ...prev, frequency: 'daily', dayOfWeek: null, dayOfMonth: '' }))}
                                    >
                                        매일
                                    </button>
                                    <button
                                        type="button"
                                        className={`px-4 py-2 rounded-xl text-white transition-colors ${formData.frequency==='weekly'? 'bg-[var(--accent-color)]':'bg-[var(--secondary-bg-color)]'}`}
                                        onClick={() => setFormData(prev => ({ ...prev, frequency: 'weekly', dayOfWeek: null, dayOfMonth: '' }))}
                                    >
                                        매주
                                    </button>
                                    <button
                                        type="button"
                                        className={`px-4 py-2 rounded-xl text-white transition-colors ${formData.frequency==='monthly'? 'bg-[var(--accent-color)]':'bg-[var(--secondary-bg-color)]'}`}
                                        onClick={() => setFormData(prev => ({ ...prev, frequency: 'monthly', dayOfWeek: null, dayOfMonth: '' }))}
                                    >
                                        매월
                                    </button>
                                </div>
                                {/* 주간/월간 추가 선택 UI */}
                                {formData.frequency === 'weekly' && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">요일 선택</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {weeklyOptions.map(opt => (
                                                <button
                                                    type="button"
                                                    key={opt.value}
                                                    className={`px-4 py-2 rounded-xl text-white transition-colors ${formData.dayOfWeek?.value === opt.value ? 'bg-[var(--accent-color)]' : 'bg-[var(--secondary-bg-color)]'}`}
                                                    onClick={() => setFormData(prev => ({ ...prev, dayOfWeek: opt }))}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {formData.frequency === 'monthly' && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">일자 선택</label>
                                        <div className="grid grid-cols-7 gap-2">
                                            {Array.from({ length: getDaysInMonth(formData.time) }, (_, i) => i + 1).map(day => (
                                                <button
                                                    type="button"
                                                    key={day}
                                                    className={`px-2 py-1 rounded-xl text-white transition-colors ${formData.dayOfMonth === day.toString() ? 'bg-[var(--accent-color)]' : 'bg-[var(--secondary-bg-color)]'}`}
                                                    onClick={() => setFormData(prev => ({ ...prev, dayOfMonth: day.toString() }))}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* 시간 선택: 코인일 때만 노출 */}
                                {assetType.value === 'coin' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">시간 선택</label>
                                    <DatePicker
                                        selected={formData.time}
                                        onChange={(date) => setFormData(prev => ({ ...prev, time: date! }))}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        timeCaption="시간"
                                        dateFormat="HH:mm"
                                        locale="ko"
                                        customInput={<TimeInput />}
                                    />
                                </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={!isFormValid}
                                className={`w-full py-3 rounded-xl text-white transition-colors ${isFormValid ? 'bg-[rgba(59,142,165,0.5)]' : 'bg-[var(--secondary-bg-color)]'}`}
                            >
                                모으기
                            </button>
                        </form>
                    </div>
                </AppPageLayout>
    );
} 