import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Searchbar, Chip, Card, IconButton, Avatar, Modal, Portal, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { productosService } from '../../src/services/productosService';
import { Producto } from '../../src/types';
import { colors, spacing } from '../../src/utils/theme';

const CATEGORIAS = ['Todos', 'Alimentos', 'Bebidas', 'Otros'];

export default function CatalogoScreen() {
  const { user, signOut } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const fetchProductos = useCallback(async () => {
    if (!user?.tienda_id) return;
    try {
      const data = await productosService.getAll(user.tienda_id, categoriaActiva);
      setProductos(data);
    } catch (error) {
      console.error('Error fetching productos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.tienda_id, categoriaActiva]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!user?.tienda_id) return;
    if (query.trim()) {
      const data = await productosService.search(user.tienda_id, query);
      setProductos(data);
    } else {
      fetchProductos();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productosService.softDelete(id);
      fetchProductos();
    } catch (error) {
      console.error('Error deleting producto:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProductos();
  };

  const handleSignOut = async () => {
    setMenuVisible(false);
    await signOut();
    router.replace('/auth/login');
  };

  const renderProducto = ({ item }: { item: Producto }) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        {item.imagen_url ? (
          <Image source={{ uri: item.imagen_url }} style={styles.productImage} />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={30} color={colors.textLight} />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.nombre}</Text>
          <Text style={styles.productCategory}>{item.categoria}</Text>
          {item.descripcion && (
            <Text style={styles.productDesc} numberOfLines={1}>{item.descripcion}</Text>
          )}
          <Text style={styles.productPrice}>${Number(item.precio).toLocaleString()}</Text>
        </View>
        {user?.rol === 'admin' && (
          <View style={styles.cardActions}>
            <IconButton icon="pencil" size={20} iconColor={colors.secondary} onPress={() => {}} />
            <IconButton icon="delete" size={20} iconColor={colors.error} onPress={() => handleDelete(item.id)} />
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catálogo</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Avatar.Text
            size={36}
            label={user?.nombre?.charAt(0).toUpperCase() || 'U'}
            style={{ backgroundColor: colors.secondary }}
          />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar productos..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* Categorías */}
      <View style={styles.categorias}>
        {CATEGORIAS.map((cat) => (
          <Chip
            key={cat}
            selected={categoriaActiva === cat}
            onPress={() => setCategoriaActiva(cat)}
            style={[
              styles.chip,
              categoriaActiva === cat && styles.chipActive,
            ]}
            textStyle={categoriaActiva === cat ? styles.chipTextActive : styles.chipText}
          >
            {cat}
          </Chip>
        ))}
      </View>

      {/* Lista de productos */}
      <FlatList
        data={productos}
        renderItem={renderProducto}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? 'Cargando...' : 'No hay productos'}
          </Text>
        }
      />

      {/* Menu Modal */}
      <Portal>
        <Modal visible={menuVisible} onDismiss={() => setMenuVisible(false)} contentContainerStyle={styles.modal}>
          <View style={styles.modalHeader}>
            <Avatar.Text
              size={48}
              label={user?.nombre?.charAt(0).toUpperCase() || 'U'}
              style={{ backgroundColor: colors.secondary }}
            />
            <Text style={styles.modalName}>{user?.nombre}</Text>
            <Text style={styles.modalEmail}>{user?.email}</Text>
            <Chip style={styles.rolChip}>
              {user?.rol === 'admin' ? '★ Administrador' : '● Empleado'}
            </Chip>
          </View>

          <Button icon="account" mode="text" onPress={() => { setMenuVisible(false); router.push('/profile/view'); }} style={styles.menuItem}>
            Ver Perfil
          </Button>
          <Button icon="pencil" mode="text" onPress={() => { setMenuVisible(false); router.push('/profile/edit'); }} style={styles.menuItem}>
            Editar Perfil
          </Button>
          {user?.rol === 'admin' && (
            <>
              <Button icon="account-plus" mode="text" onPress={() => { setMenuVisible(false); router.push('/empleados/create'); }} style={styles.menuItem}>
                Crear Empleado
              </Button>
              <Button icon="account-group" mode="text" onPress={() => { setMenuVisible(false); router.push('/empleados/list'); }} style={styles.menuItem}>
                Ver Empleados
              </Button>
            </>
          )}
          <Button icon="logout" mode="text" onPress={handleSignOut} style={styles.menuItem} textColor={colors.error}>
            Cerrar Sesión
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 50,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textWhite,
  },
  searchContainer: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchbar: {
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  categorias: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.text,
  },
  chipTextActive: {
    color: colors.textWhite,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  cardContent: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  productCategory: {
    fontSize: 12,
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  productDesc: {
    fontSize: 12,
    color: colors.textLight,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.teal,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'column',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: spacing.xl,
  },
  modal: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },
  modalEmail: {
    fontSize: 14,
    color: colors.textLight,
  },
  rolChip: {
    marginTop: spacing.sm,
  },
  menuItem: {
    justifyContent: 'flex-start',
  },
});
