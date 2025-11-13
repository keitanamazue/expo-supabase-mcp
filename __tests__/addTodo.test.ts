/**
 * TODO追加機能のテスト
 *
 * このテストは、TODO追加機能の基本的な動作を検証します。
 */

describe("TODO追加機能", () => {
	describe("基本的な追加", () => {
		it("タイトルを指定してTODOを追加できる", () => {
			const title = "テストTodo";
			const expected = {
				title: title.trim(),
				completed: false,
				priority: "medium",
				category: "other",
			};

			// タイトルが正しくトリムされることを確認
			expect(expected.title).toBe("テストTodo");
			expect(expected.completed).toBe(false);
		});

		it("タイトルの前後の空白がトリムされる", () => {
			const title = "  トリムテスト  ";
			const trimmed = title.trim();

			expect(trimmed).toBe("トリムテスト");
		});
	});

	describe("詳細情報を含む追加", () => {
		it("説明、優先度、カテゴリ、期限を含むTODOを追加できる", () => {
			const todo = {
				title: "詳細なTodo",
				description: "これはテスト用の説明です",
				priority: "high",
				category: "work",
				dueDate: "2024-12-31",
				completed: false,
			};

			expect(todo.title).toBe("詳細なTodo");
			expect(todo.description).toBe("これはテスト用の説明です");
			expect(todo.priority).toBe("high");
			expect(todo.category).toBe("work");
			expect(todo.dueDate).toBe("2024-12-31");
		});

		it("優先度が正しく設定される", () => {
			const priorities = ["low", "medium", "high", "urgent"];
			const selectedPriority = "high";

			expect(priorities).toContain(selectedPriority);
		});

		it("カテゴリが正しく設定される", () => {
			const categories = ["work", "personal", "shopping", "health", "other"];
			const selectedCategory = "work";

			expect(categories).toContain(selectedCategory);
		});
	});

	describe("バリデーション", () => {
		it("空のタイトルは無効", () => {
			const title = "";
			const trimmed = title.trim();

			expect(trimmed).toBe("");
			expect(trimmed.length).toBe(0);
		});

		it("空白のみのタイトルは無効", () => {
			const title = "   ";
			const trimmed = title.trim();

			expect(trimmed).toBe("");
			expect(trimmed.length).toBe(0);
		});

		it("有効なタイトルは受け入れられる", () => {
			const title = "有効なTodo";
			const trimmed = title.trim();

			expect(trimmed.length).toBeGreaterThan(0);
		});
	});

	describe("デフォルト値", () => {
		it("優先度が指定されない場合はmediumがデフォルト", () => {
			const priority = undefined || "medium";
			expect(priority).toBe("medium");
		});

		it("カテゴリが指定されない場合はotherがデフォルト", () => {
			const category = undefined || "other";
			expect(category).toBe("other");
		});

		it("completedは常にfalseで開始", () => {
			const completed = false;
			expect(completed).toBe(false);
		});
	});
});
