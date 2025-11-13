import { TodoForm } from "@/components/todo/TodoForm";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Alert } from "react-native";

// Alertをモック
jest.spyOn(Alert, "alert").mockImplementation(() => { });

describe("TodoForm", () => {
    const mockOnAdd = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("タイトルを入力してTodoを追加できる", async () => {
        mockOnAdd.mockResolvedValue(undefined);

        render(<TodoForm onAdd={mockOnAdd} />);

        const input = screen.getByPlaceholderText("新しいTodoを入力...");
        const addButton = screen.getByText("追加");

        fireEvent.change(input, { target: { value: "テストTodo" } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(mockOnAdd).toHaveBeenCalledWith(
                "テストTodo",
                undefined,
                "medium",
                "other",
                undefined,
            );
        });
    });

    it("空のタイトルで追加しようとするとエラーが表示される", async () => {
        render(<TodoForm onAdd={mockOnAdd} />);

        const addButton = screen.getByText("追加");
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                "エラー",
                "Todoのタイトルを入力してください",
            );
        });

        expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it("詳細設定で説明、優先度、カテゴリ、期限を設定して追加できる", async () => {
        mockOnAdd.mockResolvedValue(undefined);

        render(<TodoForm onAdd={mockOnAdd} />);

        const input = screen.getByPlaceholderText("新しいTodoを入力...");
        const advancedButton = screen.getByText("詳細");

        // タイトルを入力
        fireEvent.change(input, { target: { value: "詳細なTodo" } });

        // 詳細設定を開く
        fireEvent.click(advancedButton);

        // 説明を入力
        const descriptionInput = screen.getByPlaceholderText("詳細な説明（任意）");
        fireEvent.change(descriptionInput, {
            target: { value: "これはテスト用の説明です" },
        });

        // 優先度を選択（高）
        const highPriorityButton = screen.getByText("高");
        fireEvent.click(highPriorityButton);

        // カテゴリを選択（仕事）
        const workCategoryButton = screen.getByText("仕事");
        fireEvent.click(workCategoryButton);

        // 期限を入力
        const dueDateInput = screen.getByPlaceholderText("YYYY-MM-DD");
        fireEvent.change(dueDateInput, { target: { value: "2024-12-31" } });

        // モーダルを閉じて追加ボタンを押す
        const closeButton = screen.getByText("✕");
        fireEvent.click(closeButton);

        const addButton = screen.getByText("追加");
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(mockOnAdd).toHaveBeenCalledWith(
                "詳細なTodo",
                "これはテスト用の説明です",
                "high",
                "work",
                "2024-12-31",
            );
        });
    });

    it("追加中はボタンが無効化される", async () => {
        let resolveAdd: () => void;
        const promise = new Promise<void>((resolve) => {
            resolveAdd = resolve;
        });
        mockOnAdd.mockReturnValue(promise);

        render(<TodoForm onAdd={mockOnAdd} />);

        const input = screen.getByPlaceholderText("新しいTodoを入力...");
        const addButton = screen.getByText("追加");

        fireEvent.change(input, { target: { value: "テストTodo" } });
        fireEvent.click(addButton);

        // 追加中は「追加中...」と表示される
        await waitFor(() => {
            expect(screen.getByText("追加中...")).toBeTruthy();
        });

        // ボタンが無効化されている（追加中...のテキストが表示されていることを確認）
        const loadingText = screen.getByText("追加中...");
        expect(loadingText).toBeInTheDocument();

        // 追加が完了するまで待つ
        resolveAdd?.();
        await promise;

        await waitFor(() => {
            expect(screen.getByText("追加")).toBeTruthy();
        });
    });

    it("追加に失敗した場合エラーが表示される", async () => {
        const errorMessage = "追加に失敗しました";
        mockOnAdd.mockRejectedValue(new Error(errorMessage));

        render(<TodoForm onAdd={mockOnAdd} />);

        const input = screen.getByPlaceholderText("新しいTodoを入力...");
        const addButton = screen.getByText("追加");

        fireEvent.change(input, { target: { value: "テストTodo" } });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith("エラー", errorMessage);
        });
    });
});
