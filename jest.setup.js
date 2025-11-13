// グローバル変数の設定
global.__DEV__ = true;

// @testing-library/jest-domのマッチャーを有効化
import '@testing-library/jest-dom';

// useThemeColorフックのモック
jest.mock('@/hooks/use-theme-color', () => ({
    useThemeColor: jest.fn(() => '#000000'),
}));

// ThemedTextとThemedViewのモック（実際のコンポーネントを使用）
jest.mock('@/components/themed-text', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
        ThemedText: ({ children, ...props }: any) => {
            return React.createElement(Text, props, children);
        },
    };
});

jest.mock('@/components/themed-view', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        ThemedView: ({ children, ...props }: any) => {
            return React.createElement(View, props, children);
        },
    };
});

// Expo Routerのモック
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
    useSegments: () => [],
    Link: 'Link',
}));

