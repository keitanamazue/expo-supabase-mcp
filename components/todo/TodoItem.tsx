import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { Todo, Priority } from "@/types/todo";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (todo: Todo) => void;
}

const priorityLabels: Record<Priority, string> = {
    low: "低",
    medium: "中",
    high: "高",
    urgent: "緊急",
};

const priorityColors: Record<Priority, string> = {
    low: "#34C759",
    medium: "#FF9500",
    high: "#FF3B30",
    urgent: "#AF52DE",
};

const categoryLabels: Record<string, string> = {
    work: "仕事",
    personal: "個人",
    shopping: "買い物",
    health: "健康",
    other: "その他",
};

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
    const handleDelete = () => {
        Alert.alert("Todoを削除", "このTodoを削除してもよろしいですか？", [
            { text: "キャンセル", style: "cancel" },
            {
                text: "削除",
                style: "destructive",
                onPress: () => onDelete(todo.id),
            },
        ]);
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString("ja-JP", {
            month: "short",
            day: "numeric",
        });
    };

    const isOverdue = todo.due_date && !todo.completed && new Date(todo.due_date) < new Date();

    return (
        <ThemedView
            testID={`todo-item-${todo.id}`}
            style={[
                styles.container,
                todo.completed && styles.containerCompleted,
                isOverdue && !todo.completed && styles.containerOverdue,
            ]}
        >
            <TouchableOpacity
                testID={`todo-toggle-${todo.id}`}
                style={styles.content}
                onPress={() => onToggle(todo.id)}
                activeOpacity={0.7}
            >
                <ThemedView
                    style={[
                        styles.checkbox,
                        todo.completed && styles.checkboxChecked,
                    ]}
                >
                    {todo.completed && (
                        <ThemedText style={styles.checkmark}>✓</ThemedText>
                    )}
                </ThemedView>
                <ThemedView style={styles.textContainer}>
                    <ThemedText
                        style={[
                            styles.title,
                            todo.completed && styles.titleCompleted,
                        ]}
                    >
                        {todo.title}
                    </ThemedText>
                    {todo.description && (
                        <ThemedText
                            style={[
                                styles.description,
                                todo.completed && styles.descriptionCompleted,
                            ]}
                            numberOfLines={2}
                        >
                            {todo.description}
                        </ThemedText>
                    )}
                    <ThemedView style={styles.metaContainer}>
                        <ThemedView
                            style={[
                                styles.priorityBadge,
                                { backgroundColor: priorityColors[todo.priority] + "20" },
                            ]}
                        >
                            <ThemedText
                                style={[
                                    styles.priorityText,
                                    { color: priorityColors[todo.priority] },
                                ]}
                            >
                                {priorityLabels[todo.priority]}
                            </ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.categoryBadge}>
                            <ThemedText style={styles.categoryText}>
                                {categoryLabels[todo.category] || todo.category}
                            </ThemedText>
                        </ThemedView>
                        {todo.due_date && (
                            <ThemedText
                                style={[
                                    styles.dueDate,
                                    isOverdue && styles.dueDateOverdue,
                                ]}
                            >
                                📅 {formatDate(todo.due_date)}
                            </ThemedText>
                        )}
                    </ThemedView>
                </ThemedView>
            </TouchableOpacity>
            <ThemedView style={styles.actions}>
                <TouchableOpacity
                    testID={`todo-edit-${todo.id}`}
                    style={styles.editButton}
                    onPress={() => onEdit(todo)}
                    activeOpacity={0.7}
                >
                    <ThemedText style={styles.editText}>編集</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    testID={`todo-delete-${todo.id}`}
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                >
                    <ThemedText style={styles.deleteText}>削除</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        marginVertical: 4,
        marginHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        backgroundColor: "#fff",
    },
    containerCompleted: {
        opacity: 0.6,
    },
    containerOverdue: {
        borderColor: "#FF3B30",
        borderWidth: 2,
    },
    content: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#007AFF",
        marginRight: 12,
        marginTop: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxChecked: {
        backgroundColor: "#007AFF",
    },
    checkmark: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    titleCompleted: {
        textDecorationLine: "line-through",
    },
    description: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 8,
    },
    descriptionCompleted: {
        opacity: 0.5,
    },
    metaContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center",
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: "600",
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: "#f0f0f0",
    },
    categoryText: {
        fontSize: 12,
        color: "#666",
    },
    dueDate: {
        fontSize: 12,
        color: "#666",
    },
    dueDateOverdue: {
        color: "#FF3B30",
        fontWeight: "600",
    },
    actions: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
        justifyContent: "flex-end",
    },
    editButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: "#007AFF",
    },
    editText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    deleteButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: "#ff3b30",
    },
    deleteText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});
