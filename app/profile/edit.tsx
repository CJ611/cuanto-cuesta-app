import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { usuariosService } from '../../src/services/usuariosService';
import { colors, spacing } from '../../src/utils/theme';

export default function EditProfileScreen() {
  const { user, refreshUser } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    if (!user?.id) return;

    setLoading(true);
    try {
      await usuariosService.updateProfile(user.id, { nombre: nombre.trim() });
      await refreshUser();
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
      </View>

      <View style={styles.content}>
        <TextInput
          label="Nombre"
          value={nombre}
          onChangeText={setNombre}
          mode="outlined"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
          buttonColor={colors.primary}
        >
          Guardar Cambios
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
  content: {
    padding: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  saveButton: {
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  backButton: {
    marginTop: spacing.md,
  },
});
