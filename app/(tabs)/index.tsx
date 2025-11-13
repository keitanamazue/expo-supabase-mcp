import {
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Alert,
    TextInput,
    Modal,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTodos } from "@/hooks/useTodos";
import { TodoItem } from "@/components/todo/TodoItem";
import { TodoForm } from "@/components/todo/TodoForm";
import { TodoEditModal } from "@/components/todo/TodoEditModal";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import type { Todo, FilterType, SortType } from "@/types/todo";

export default function TodoScreen() {
    const { todos, loading, error, addTodo, deleteTodo, toggleTodo, updateTodo, refetch } =
        useTodos();
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>("all");
    const [sort, setSort] = useState<SortType>("created");
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

    const handleSignOut = async () => {
        Alert.alert("ログアウト", "ログアウトしてもよろしいですか？", [
            { text: "キャンセル", style: "cancel" },
            {
                text: "ログアウト",
                style: "destructive",
                onPress: async () => {
                    try {
                        await signOut();
                        router.replace("/auth");
                    } catch (error) {
                        Alert.alert("エラー", "ログアウトに失敗しました");
                    }
                },
            },
        ]);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleAddTodo = async (
        title: string,
        description?: string,
        priority?: any,
        category?: any,
        dueDate?: string
    ) => {
        await addTodo(title, description, priority, category, dueDate);
    };

    const filteredAndSortedTodos = useMemo(() => {
        let filtered = [...todos];

        // 検索フィルタ
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (todo) =>
                    todo.title.toLowerCase().includes(query) ||
                    todo.description?.toLowerCase().includes(query)
            );
        }

        // フィルタリング
        if (filter === "active") {
            filtered = filtered.filter((todo) => !todo.completed);
        } else if (filter === "completed") {
            filtered = filtered.filter((todo) => todo.completed);
        }

        // ソート
        filtered.sort((a, b) => {
            switch (sort) {
                case "priority":
                    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case "due_date":
                    if (!a.due_date && !b.due_date) return 0;
                    if (!a.due_date) return 1;
                    if (!b.due_date) return -1;
                    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                case "title":
                    return a.title.localeCompare(b.title);
                case "created":
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });

        return filtered;
    }, [todos, filter, sort, searchQuery]);

    const stats = useMemo(() => {
        const total = todos.length;
        const completed = todos.filter((t) => t.completed).length;
        const active = total - completed;
        const overdue = todos.filter(
            (t) => !t.completed && t.due_date && new Date(t.due_date) < new Date()
        ).length;
        return { total, completed, active, overdue };
    }, [todos]);

    if (loading && !refreshing) {
        return (
            <ThemedView style={styles.centerContainer}>
                <ActivityIndicator size="large" />
                <ThemedText style={styles.loadingText}>読み込み中...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedView style={styles.headerRow}>
                    <ThemedText type="title">Todoリスト</ThemedText>
                    {user && (
                        <TouchableOpacity
                            testID="todo-signout-button"
                            style={styles.signOutButton}
                            onPress={handleSignOut}
                            activeOpacity={0.7}
                        >
                            <ThemedText style={styles.signOutText}>ログアウト</ThemedText>
                        </TouchableOpacity>
                    )}
                </ThemedView>
                {user && (
                    <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
                )}
                {error && (
                    <ThemedView style={styles.errorContainer}>
                        <ThemedText style={styles.errorText}>{error}</ThemedText>
                    </ThemedView>
                )}
            </ThemedView>

            {/* 統計情報 */}
            <ThemedView style={styles.statsContainer}>
                <ThemedView style={styles.statItem}>
                    <ThemedText style={styles.statValue}>{stats.total}</ThemedText>
                    <ThemedText style={styles.statLabel}>合計</ThemedText>
                </ThemedView>
                <ThemedView style={styles.statItem}>
                    <ThemedText style={[styles.statValue, styles.statValueActive]}>
                        {stats.active}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>未完了</ThemedText>
                </ThemedView>
                <ThemedView style={styles.statItem}>
                    <ThemedText style={[styles.statValue, styles.statValueCompleted]}>
                        {stats.completed}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>完了</ThemedText>
                </ThemedView>
                {stats.overdue > 0 && (
                    <ThemedView style={styles.statItem}>
                        <ThemedText style={[styles.statValue, styles.statValueOverdue]}>
                            {stats.overdue}
                        </ThemedText>
                        <ThemedText style={styles.statLabel}>期限切れ</ThemedText>
                    </ThemedView>
                )}
            </ThemedView>

            {/* 検索バー */}
            <ThemedView style={styles.searchContainer}>
                <TextInput
                    testID="todo-search-input"
                    style={styles.searchInput}
                    placeholder="検索..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity
                    testID="todo-filter-button"
                    style={styles.filterButton}
                    onPress={() => setShowFilters(true)}
                    activeOpacity={0.7}
                >
                    <ThemedText style={styles.filterButtonText}>フィルタ</ThemedText>
                </TouchableOpacity>
            </ThemedView>

            <TodoForm onAdd={handleAddTodo} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {filteredAndSortedTodos.length === 0 ? (
                    <ThemedView style={styles.emptyContainer}>
                        <ThemedText style={styles.emptyText}>
                            {searchQuery
                                ? "検索結果がありません"
                                : "Todoがありません\n新しいTodoを追加してください"}
                        </ThemedText>
                    </ThemedView>
                ) : (
                    filteredAndSortedTodos.map((todo) => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={toggleTodo}
                            onDelete={deleteTodo}
                            onEdit={setEditingTodo}
                        />
                    ))
                )}
            </ScrollView>

            {/* フィルタ・ソートモーダル */}
            <Modal
                visible={showFilters}
                animationType="slide"
                transparent
                onRequestClose={() => setShowFilters(false)}
            >
                <ThemedView style={styles.modalOverlay}>
                    <ThemedView style={styles.modalContent}>
                        <ThemedView style={styles.modalHeader}>
                            <ThemedText type="subtitle">フィルタ・ソート</ThemedText>
                            <TouchableOpacity testID="todo-filter-close-button" onPress={() => setShowFilters(false)}>
                                <ThemedText style={styles.closeButton}>✕</ThemedText>
                            </TouchableOpacity>
                        </ThemedView>

                        <ThemedView style={styles.filterContent}>
                            <ThemedText style={styles.filterLabel}>表示</ThemedText>
                            <ThemedView style={styles.filterOptions}>
                                {(["all", "active", "completed"] as FilterType[]).map((f) => (
                                    <TouchableOpacity
                                        testID={`todo-filter-option-${f}`}
                                        key={f}
                                        style={[
                                            styles.filterOption,
                                            filter === f && styles.filterOptionSelected,
                                        ]}
                                        onPress={() => setFilter(f)}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.filterOptionText,
                                                filter === f && styles.filterOptionTextSelected,
                                            ]}
                                        >
                                            {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了"}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </ThemedView>

                            <ThemedText style={styles.filterLabel}>並び替え</ThemedText>
                            <ThemedView style={styles.filterOptions}>
                                {(["created", "priority", "due_date", "title"] as SortType[]).map(
                                    (s) => (
                                        <TouchableOpacity
                                            testID={`todo-sort-option-${s}`}
                                            key={s}
                                            style={[
                                                styles.filterOption,
                                                sort === s && styles.filterOptionSelected,
                                            ]}
                                            onPress={() => setSort(s)}
                                        >
                                            <ThemedText
                                                style={[
                                                    styles.filterOptionText,
                                                    sort === s && styles.filterOptionTextSelected,
                                                ]}
                                            >
                                                {s === "created"
                                                    ? "作成日"
                                                    : s === "priority"
                                                      ? "優先度"
                                                      : s === "due_date"
                                                        ? "期限"
                                                        : "タイトル"}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    )
                                )}
                            </ThemedView>
                        </ThemedView>
                    </ThemedView>
                </ThemedView>
            </Modal>

            {/* 編集モーダル */}
            <TodoEditModal
                visible={!!editingTodo}
                todo={editingTodo}
                onClose={() => setEditingTodo(null)}
                onSave={async (id, updates) => {
                    await updateTodo(id, updates);
                    setEditingTodo(null);
                }}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    header: {
        padding: 16,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    userEmail: {
        marginTop: 4,
        fontSize: 14,
        opacity: 0.6,
    },
    signOutButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: "#ff3b30",
    },
    signOutText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    errorContainer: {
        marginTop: 8,
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#ffebee",
    },
    errorText: {
        color: "#c62828",
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: "row",
        padding: 16,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    statValueActive: {
        color: "#FF9500",
    },
    statValueCompleted: {
        color: "#34C759",
    },
    statValueOverdue: {
        color: "#FF3B30",
    },
    statLabel: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 4,
    },
    searchContainer: {
        flexDirection: "row",
        padding: 16,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    searchInput: {
        flex: 1,
        height: 40,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        fontSize: 16,
        backgroundColor: "#f5f5f5",
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: "#007AFF",
        justifyContent: "center",
    },
    filterButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyText: {
        textAlign: "center",
        fontSize: 16,
        opacity: 0.6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "60%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    closeButton: {
        fontSize: 24,
        color: "#666",
    },
    filterContent: {
        padding: 20,
        gap: 24,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    filterOptions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    filterOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        backgroundColor: "#f5f5f5",
    },
    filterOptionSelected: {
        backgroundColor: "#007AFF",
        borderColor: "#007AFF",
    },
    filterOptionText: {
        fontSize: 14,
        color: "#333",
    },
    filterOptionTextSelected: {
        color: "#fff",
        fontWeight: "600",
    },
});
