import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { Category, Priority, Todo, TodoUpdate } from "@/types/todo";
import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";

interface TodoEditModalProps {
    visible: boolean;
    todo: Todo | null;
    onClose: () => void;
    onSave: (id: string, updates: TodoUpdate) => Promise<void>;
}

const priorities: Priority[] = ["low", "medium", "high", "urgent"];
const categories: Category[] = [
    "work",
    "personal",
    "shopping",
    "health",
    "other",
];

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

export function TodoEditModal({
    visible,
    todo,
    onClose,
    onSave,
}: TodoEditModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>("medium");
    const [category, setCategory] = useState<Category>("other");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (todo) {
            setTitle(todo.title);
            setDescription(todo.description || "");
            setPriority(todo.priority);
            setCategory(todo.category);
            setDueDate(todo.due_date ? todo.due_date.split("T")[0] : "");
        }
    }, [todo]);

    const handleSave = async () => {
        if (!todo || !title.trim()) return;

        try {
            setLoading(true);
            const updates: TodoUpdate = {
                title: title.trim(),
                description: description.trim() || null,
                priority,
                category,
                due_date: dueDate || null,
            };
            await onSave(todo.id, updates);
            onClose();
        } catch (error) {
            console.error("Error saving todo:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!todo) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <TouchableOpacity
                    testID="todo-edit-modal-overlay"
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        style={styles.modalTouchable}
                    >
                        <ThemedView style={styles.modalContent}>
                            <ThemedView style={styles.modalHeader}>
                                <ThemedText type="title">Todoを編集</ThemedText>
                                <TouchableOpacity
                                    testID="todo-edit-close-button"
                                    onPress={onClose}
                                >
                                    <ThemedText style={styles.closeButton}>✕</ThemedText>
                                </TouchableOpacity>
                            </ThemedView>

                            <ScrollView
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={true}
                            >
                                <ThemedView style={styles.form}>
                                    <ThemedText style={styles.label}>タイトル *</ThemedText>
                                    <TextInput
                                        testID="todo-edit-title-input"
                                        style={styles.input}
                                        value={title}
                                        onChangeText={setTitle}
                                        placeholder="Todoのタイトル"
                                        placeholderTextColor="#999"
                                    />

                                    <ThemedText style={styles.label}>説明</ThemedText>
                                    <TextInput
                                        testID="todo-edit-description-input"
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
                                                testID={`todo-edit-priority-${p}`}
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
                                                testID={`todo-edit-category-${c}`}
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
                                        testID="todo-edit-due-date-input"
                                        style={styles.input}
                                        value={dueDate}
                                        onChangeText={setDueDate}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor="#999"
                                    />
                                </ThemedView>
                            </ScrollView>

                            <ThemedView style={styles.modalFooter}>
                                <TouchableOpacity
                                    testID="todo-edit-cancel-button"
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={onClose}
                                >
                                    <ThemedText style={styles.cancelButtonText}>
                                        キャンセル
                                    </ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    testID="todo-edit-save-button"
                                    style={[
                                        styles.button,
                                        styles.saveButton,
                                        loading && styles.buttonDisabled,
                                    ]}
                                    onPress={handleSave}
                                    disabled={loading || !title.trim()}
                                >
                                    <ThemedText style={styles.saveButtonText}>
                                        {loading ? "保存中..." : "保存"}
                                    </ThemedText>
                                </TouchableOpacity>
                            </ThemedView>
                        </ThemedView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalTouchable: {
        width: "100%",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "90%",
        width: "100%",
        flexShrink: 1,
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
    scrollContent: {
        paddingBottom: 20,
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
    input: {
        height: 44,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        fontSize: 16,
        backgroundColor: "#f5f5f5",
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
    modalFooter: {
        flexDirection: "row",
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    button: {
        flex: 1,
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#f5f5f5",
    },
    cancelButtonText: {
        color: "#333",
        fontSize: 16,
        fontWeight: "600",
    },
    saveButton: {
        backgroundColor: "#007AFF",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
