import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar, Button, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing } from '../../src/utils/theme';

export default function ViewProfileScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <Avatar.Text
            size={80}
            label={user?.nombre?.charAt(0).toUpperCase() || 'U'}
            style={{ backgroundColor: colors.secondary }}
          />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <Text style={styles.value}>{user?.nombre}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Rol</Text>
              <Text style={styles.value}>
                {user?.rol === 'admin' ? 'Administrador' : 'Empleado'}
              </Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>ID Tienda</Text>
              <Text style={styles.valueSmall}>{user?.tienda_id}</Text>
            </View>
          </Card.Content>
        </Card>

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
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  field: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  valueSmall: {
    fontSize: 12,
    color: colors.textLight,
    fontFamily: 'monospace',
  },
  backButton: {
    marginTop: spacing.lg,
  },
});
