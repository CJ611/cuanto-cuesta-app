import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Button, SegmentedButtons, Card, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../src/hooks/useAuth';
import { productosService } from '../../src/services/productosService';
import { facturasService } from '../../src/services/facturasService';
import { Producto, Factura, CartItem } from '../../src/types';
import { colors, spacing } from '../../src/utils/theme';

export default function FacturasScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState('nueva');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProductos = useCallback(async () => {
    if (!user?.tienda_id) return;
    try {
      const data = await productosService.getByTienda(user.tienda_id);
      setProductos(data);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [user?.tienda_id]);

  const fetchFacturas = useCallback(async () => {
    if (!user?.tienda_id) return;
    try {
      const data = await facturasService.getByTienda(user.tienda_id);
      setFacturas(data);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [user?.tienda_id]);

  useEffect(() => {
    if (tab === 'nueva') {
      fetchProductos();
    } else {
      fetchFacturas();
    }
  }, [tab, fetchProductos, fetchFacturas]);

  const addToCart = (producto: Producto) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.producto.id === producto.id);
      if (existing) {
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
  };

  const handleCreateFactura = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Agrega productos al carrito');
      return;
    }

    if (!user?.id || !user?.tienda_id) return;

    setLoading(true);
    try {
      await facturasService.create(user.id, user.tienda_id, cart);
      Alert.alert('Éxito', 'Factura generada correctamente');
      setCart([]);
      setTab('historial');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear la factura');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (factura: Factura) => {
    try {
      const facturaDetail = await facturasService.getById(factura.id);
      const html = facturasService.generatePDFHtml(factura, facturaDetail.items, productos);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo exportar el PDF');
    }
  };

  const renderProductoItem = ({ item }: { item: Producto }) => (
    <View style={styles.posItem}>
      <View style={styles.posItemInfo}>
        <Text style={styles.posItemName}>{item.nombre}</Text>
        <Text style={styles.posItemPrice}>${Number(item.precio).toLocaleString()}</Text>
      </View>
      <Button
        mode="contained"
        onPress={() => addToCart(item)}
        compact
        buttonColor={colors.secondary}
        style={styles.addButton}
      >
        +
      </Button>
    </View>
  );

  const renderFacturaItem = ({ item }: { item: Factura }) => (
    <Card style={styles.facturaCard}>
      <Card.Content>
        <View style={styles.facturaHeader}>
          <View>
            <Text style={styles.facturaId}>#{item.id.substring(0, 8).toUpperCase()}</Text>
            <Text style={styles.facturaDate}>
              {new Date(item.created_at).toLocaleDateString('es-CO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            <Chip compact style={styles.statusChip} textStyle={styles.statusText}>
              ● COMPLETADA
            </Chip>
          </View>
          <View style={styles.facturaRight}>
            <Text style={styles.facturaTotal}>${Number(item.total).toLocaleString()}</Text>
            <Button
              mode="outlined"
              compact
              onPress={() => handleExportPDF(item)}
              style={styles.pdfButton}
            >
              PDF
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Facturación</Text>
        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          buttons={[
            { value: 'nueva', label: 'Nueva' },
            { value: 'historial', label: 'Historial' },
          ]}
          style={styles.tabButtons}
        />
      </View>

      {tab === 'nueva' ? (
        <View style={styles.posContainer}>
          <FlatList
            data={productos}
            renderItem={renderProductoItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.posList}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay productos</Text>}
          />
          {cart.length > 0 && (
            <View style={styles.cartSummary}>
              <Text style={styles.cartTotal}>
                Total: ${getTotal().toLocaleString()} ({cart.reduce((s, i) => s + i.cantidad, 0)} items)
              </Text>
              <Button
                mode="contained"
                onPress={handleCreateFactura}
                loading={loading}
                buttonColor={colors.secondary}
              >
                Generar Factura
              </Button>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={facturas}
          renderItem={renderFacturaItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.facturasList}
          ListHeaderComponent={
            <View style={styles.facturasHeader}>
              <Text style={styles.facturasTitle}>Facturas Generadas</Text>
              <Button compact onPress={fetchFacturas} icon="refresh">
                Actualizar
              </Button>
            </View>
          }
          ListEmptyComponent={<Text style={styles.emptyText}>No hay facturas</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingTop: 50,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  tabButtons: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  posContainer: {
    flex: 1,
  },
  posList: {
    padding: spacing.md,
  },
  posItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  posItemInfo: {
    flex: 1,
  },
  posItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  posItemPrice: {
    fontSize: 14,
    color: colors.teal,
    fontWeight: 'bold',
  },
  addButton: {
    borderRadius: 20,
    minWidth: 40,
  },
  cartSummary: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  facturasList: {
    padding: spacing.md,
  },
  facturasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  facturasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  facturaCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  facturaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  facturaId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  facturaDate: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  statusChip: {
    marginTop: spacing.xs,
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    color: colors.success,
  },
  facturaRight: {
    alignItems: 'flex-end',
  },
  facturaTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  pdfButton: {
    marginTop: spacing.xs,
    borderColor: colors.secondary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: spacing.xl,
  },
});
