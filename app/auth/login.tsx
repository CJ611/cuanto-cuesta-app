import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing } from '../../src/utils/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message || 'Error al iniciar sesión');
    } else {
      router.replace('/(tabs)');
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>¿Cuánto cuesta?</Text>
          <Text style={styles.subtitle}>Gestión de precios</Text>
        </View>

        <View style={styles.tabs}>
          <SegmentedButtons
            value="login"
            onValueChange={(value) => {
              if (value === 'register') router.push('/auth/register');
            }}
            buttons={[
              { value: 'login', label: 'Iniciar Sesión' },
              { value: 'register', label: 'Crear Cuenta' },
            ]}
          />
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="tu@email.com"
            style={styles.input}
          />

          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor={colors.primary}
          >
            Iniciar Sesión
          </Button>

          <Button
            mode="text"
            onPress={() => {}}
            style={styles.forgotButton}
            textColor={colors.textLight}
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  tabs: {
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
  },
  button: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  forgotButton: {
    marginTop: spacing.sm,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
  },
});
