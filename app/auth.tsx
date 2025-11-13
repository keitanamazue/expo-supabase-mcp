import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("エラー", "メールアドレスとパスワードを入力してください");
      return;
    }

    if (password.length < 6) {
      Alert.alert("エラー", "パスワードは6文字以上で入力してください");
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert(
          "成功",
          "アカウントを作成しました。メールを確認してください。",
        );
      } else {
        await signIn(email, password);
        router.replace("/(tabs)");
      }
    } catch (error) {
      Alert.alert(
        "エラー",
        error instanceof Error ? error.message : "認証に失敗しました",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">
            {isSignUp ? "アカウント作成" : "ログイン"}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {isSignUp
              ? "新しいアカウントを作成してください"
              : "Todoリストにアクセスするにはログインしてください"}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          <TextInput
            testID="login-email-input"
            style={styles.input}
            placeholder="メールアドレス"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />
          <TextInput
            testID="login-password-input"
            style={styles.input}
            placeholder="パスワード"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            editable={!loading}
          />

          <TouchableOpacity
            testID="login-submit-button"
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.buttonText}>
              {loading
                ? isSignUp
                  ? "作成中..."
                  : "ログイン中..."
                : isSignUp
                  ? "アカウント作成"
                  : "ログイン"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            testID="login-switch-mode-button"
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            <ThemedText style={styles.switchText}>
              {isSignUp
                ? "既にアカウントをお持ちですか？ログイン"
                : "アカウントをお持ちでない方はこちら"}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    opacity: 0.7,
  },
  form: {
    gap: 16,
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
    backgroundColor: "#f5f5f5",
  },
  button: {
    height: 50,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchButton: {
    marginTop: 16,
    padding: 12,
  },
  switchText: {
    textAlign: "center",
    color: "#007AFF",
    fontSize: 14,
  },
});
