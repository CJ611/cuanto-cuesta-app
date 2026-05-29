import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { empleadosService } from '../../src/services/empleadosService';
import { colors, spacing } from '../../src/utils/theme';

export default function CreateEmpleadoScreen() {
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!nombre || !email || !password) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener mínimo 6 caracteres');
      return;
    }

    if (!user?.tienda_id) return;

    setLoading(true);
    try {
      await empleadosService.create(email, nombre, password, user.tienda_id);
      Alert.alert('Éxito', 'Empleado creado correctamente. El empleado quedará vinculado a tu tienda automáticamente.');
      setNombre('');
      setEmail('');
      setPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear el empleado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crear Empleado</Text>
        <Text style={styles.headerSubtitle}>
          El empleado quedará vinculado a tu tienda automáticamente
        </Text>
      </View>

      <View style={styles.content}>
        <TextInput
          label="Nombre del empleado"
          value={nombre}
          onChangeText={setNombre}
          mode="outlined"
          placeholder="Nombre completo"
          style={styles.input}
        />

        <TextInput
          label="Email del empleado"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="empleado@email.com"
          style={styles.input}
        />

        <TextInput
          label="Contraseña temporal"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          placeholder="Mínimo 6 caracteres"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleCreate}
          loading={loading}
          disabled={loading}
          style={styles.createButton}
          buttonColor={colors.primary}
        >
          Crear Empleado
        </Button>

        <Button
          mode="text"
          onPress={() => router.back()}
          style={styles.backButton}
          textColor={colors.secondary}
        >
          ← Volver
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingTop: 50,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textWhite,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textWhite,
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
  },
  createButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  backButton: {
    marginTop: spacing.sm,
  },
});
