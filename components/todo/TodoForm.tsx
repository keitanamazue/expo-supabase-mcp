import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView } from "react-native";
import type { Priority, Category } from "@/types/todo";

interface TodoFormProps {
    onAdd: (title: string, description?: string, priority?: Priority, category?: Category, dueDate?: string) => Promise<void>;
}

const priorities: Priority[] = ["low", "medium", "high", "urgent"];
const categories: Category[] = ["work", "personal", "shopping", "health", "other"];

const priorityLabels: Record<Priority, string> = {
    low: "低",
    medium: "中",
    high: "高",
    urgent: "緊急",
};

const categoryLabels: Record<Category, string> = {
    work: "仕事",
    personal: "個人",
    shopping: "買い物",
    health: "健康",
    other: "その他",
};

const priorityColors: Record<Priority, string> = {
    low: "#34C759",
    medium: "#FF9500",
    high: "#FF3B30",
    urgent: "#AF52DE",
};

export function TodoForm({ onAdd }: TodoFormProps) {
    const [title, setTitle] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>("medium");
    const [category, setCategory] = useState<Category>("other");
    const [dueDate, setDueDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            Alert.alert("エラー", "Todoのタイトルを入力してください");
            return;
        }

        try {
            setIsSubmitting(true);
            await onAdd(
                trimmedTitle,
                description.trim() || undefined,
                priority,
                category,
                dueDate || undefined
            );
            setTitle("");
            setDescription("");
            setPriority("medium");
            setCategory("other");
            setDueDate("");
            setShowAdvanced(false);
        } catch (error) {
            Alert.alert(
                "エラー",
                error instanceof Error ? error.message : "Todoの追加に失敗しました",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <ThemedView style={styles.container}>
                <TextInput
                    testID="todo-input"
                    style={styles.input}
                    placeholder="新しいTodoを入力..."
                    placeholderTextColor="#999"
                    value={title}
                    onChangeText={setTitle}
                    onSubmitEditing={handleSubmit}
                    editable={!isSubmitting}
                />
                <TouchableOpacity
                    testID="todo-add-button"
                    style={styles.addButton}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.7}
                >
                    <ThemedText style={styles.addButtonText}>
                        {isSubmitting ? "追加中..." : "追加"}
                    </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    testID="todo-advanced-button"
                    style={styles.advancedButton}
                    onPress={() => setShowAdvanced(true)}
                    activeOpacity={0.7}
                >
                    <ThemedText style={styles.advancedButtonText}>詳細</ThemedText>
                </TouchableOpacity>
            </ThemedView>

            <Modal
                visible={showAdvanced}
                animationType="slide"
                transparent
                onRequestClose={() => setShowAdvanced(false)}
            >
                <ThemedView style={styles.modalOverlay}>
                    <ThemedView style={styles.modalContent}>
                        <ThemedView style={styles.modalHeader}>
                            <ThemedText type="subtitle">詳細設定</ThemedText>
                            <TouchableOpacity testID="todo-advanced-close-button" onPress={() => setShowAdvanced(false)}>
                                <ThemedText style={styles.closeButton}>✕</ThemedText>
                            </TouchableOpacity>
                        </ThemedView>

                        <ScrollView style={styles.scrollView}>
                            <ThemedView style={styles.form}>
                                <ThemedText style={styles.label}>説明</ThemedText>
                                <TextInput
                                    testID="todo-description-input"
                                    style={[styles.input, styles.textArea]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="詳細な説明（任意）"
                                    placeholderTextColor="#999"
                                    multiline
                                    numberOfLines={4}
                                />

                                <ThemedText style={styles.label}>優先度</ThemedText>
                                <ThemedView style={styles.optionsRow}>
                                    {priorities.map((p) => (
                                        <TouchableOpacity
                                            testID={`todo-priority-${p}`}
                                            key={p}
                                            style={[
                                                styles.optionButton,
                                                priority === p && {
                                                    backgroundColor: priorityColors[p],
                                                },
                                            ]}
                                            onPress={() => setPriority(p)}
                                        >
                                            <ThemedText
                                                style={[
                                                    styles.optionText,
                                                    priority === p && styles.optionTextSelected,
                                                ]}
                                            >
                                                {priorityLabels[p]}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </ThemedView>

                                <ThemedText style={styles.label}>カテゴリ</ThemedText>
                                <ThemedView style={styles.optionsRow}>
                                    {categories.map((c) => (
                                        <TouchableOpacity
                                            testID={`todo-category-${c}`}
                                            key={c}
                                            style={[
                                                styles.optionButton,
                                                category === c && styles.optionButtonSelected,
                                            ]}
                                            onPress={() => setCategory(c)}
                                        >
                                            <ThemedText
                                                style={[
                                                    styles.optionText,
                                                    category === c && styles.optionTextSelected,
                                                ]}
                                            >
                                                {categoryLabels[c]}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </ThemedView>

                                <ThemedText style={styles.label}>期限</ThemedText>
                                <TextInput
                                    testID="todo-due-date-input"
                                    style={styles.input}
                                    value={dueDate}
                                    onChangeText={setDueDate}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#999"
                                />
                            </ThemedView>
                        </ScrollView>
                    </ThemedView>
                </ThemedView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        padding: 16,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    input: {
        flex: 1,
        height: 44,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        fontSize: 16,
        backgroundColor: "#f5f5f5",
    },
    addButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    advancedButton: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    advancedButtonText: {
        color: "#333",
        fontSize: 14,
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
        maxHeight: "80%",
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
    scrollView: {
        flex: 1,
    },
    form: {
        padding: 20,
        gap: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
        paddingTop: 12,
    },
    optionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    optionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        backgroundColor: "#f5f5f5",
    },
    optionButtonSelected: {
        backgroundColor: "#007AFF",
        borderColor: "#007AFF",
    },
    optionText: {
        fontSize: 14,
        color: "#333",
    },
    optionTextSelected: {
        color: "#fff",
        fontWeight: "600",
    },
});
