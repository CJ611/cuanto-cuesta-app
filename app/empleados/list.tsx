import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Avatar, Button, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { empleadosService } from '../../src/services/empleadosService';
import { Usuario } from '../../src/types';
import { colors, spacing } from '../../src/utils/theme';

export default function ListEmpleadosScreen() {
  const { user } = useAuth();
  const [empleados, setEmpleados] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
    if (!user?.tienda_id) return;
    try {
      const data = await empleadosService.getByTienda(user.tienda_id);
      setEmpleados(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEmpleado = ({ item }: { item: Usuario }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Text
          size={44}
          label={item.nombre.charAt(0).toUpperCase()}
          style={{
            backgroundColor: item.rol === 'admin' ? colors.primary : colors.secondary,
          }}
        />
        <View style={styles.info}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <Text style={styles.rol}>
            {item.rol === 'admin' ? '★ Admin' : '● Empleado'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Empleados</Text>
      </View>

      <FlatList
        data={empleados}
        renderItem={renderEmpleado}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? 'Cargando...' : 'No hay empleados registrados'}
          </Text>
        }
      />

      <View style={styles.footer}>
        <Button
          mode="text"
          onPress={() => router.back()}
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
  list: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  info: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  email: {
    fontSize: 13,
    color: colors.textLight,
  },
  rol: {
    fontSize: 12,
    color: colors.secondary,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: spacing.xl,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
